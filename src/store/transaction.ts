import { walletData } from "@/plugins/walletData";
import { ZkInBalancesList, GweiBalance, ZkInDeposits, ZKInDepositTx } from "@/types/lib";
import { BigNumber } from "ethers";
import { actionTree, getterTree, mutationTree } from "typed-vuex/lib";
import { Address, ChangePubKeyFee, ChangePubkeyTypes, Fee, TokenSymbol } from "zksync/build/types";
import { ETHOperation } from "zksync/build/wallet";

interface ZKITransactionsState {
  watchedTransactions: { [p: string]: { [p: string]: string; status: string } };
  deposits: ZkInDeposits;
  forceUpdateTick: number;
  withdrawalTxToEthTx: Map<string, string>;
}

export const state = () =>
  ({
    watchedTransactions: <
      {
        [txHash: string]: {
          [prop: string]: string;
          status: string;
        };
      }
    >{},
    deposits: <ZkInDeposits>{},
    forceUpdateTick: 0 /* Used to force update computed active deposits list */,
    withdrawalTxToEthTx: <Map<string, string>>new Map(),
  } as ZKITransactionsState);

export type TransactionModuleState = ReturnType<typeof state>;

interface ZKITransactionParams {
  tokenSymbol: TokenSymbol;
  hash: string;
  amount?: BigNumber | GweiBalance;
  status: string;
  confirmations?: number;
}

export const mutations = mutationTree(state, {
  updateTransactionStatus(state: TransactionModuleState, { hash, status }: { hash: string; status: string }): void {
    if (status === "Verified") {
      delete state.watchedTransactions[hash];
      return;
    }
    if (!Object.prototype.hasOwnProperty.call(state.watchedTransactions, hash)) {
      state.watchedTransactions[hash] = {
        status,
      };
    } else {
      state.watchedTransactions[hash].status = status;
    }
  },
  updateDepositStatus: (state: TransactionModuleState, { tokenSymbol, hash, amount, status, confirmations }: ZKITransactionParams): void => {
    if (!Array.isArray(state.deposits[tokenSymbol])) {
      state.deposits[tokenSymbol] = [];
    }
    let txIndex = -1;
    for (let a = 0; a < state.deposits[tokenSymbol].length; a++) {
      if (state.deposits[tokenSymbol][a].hash === hash) {
        txIndex = a;
        break;
      }
    }
    if (txIndex === -1) {
      state.deposits[tokenSymbol].push(<ZKInDepositTx>{
        hash,
        amount,
        status,
        confirmations,
      });
    } else if (status === "Committed") {
      state.deposits[tokenSymbol].splice(txIndex, 1);
    } else {
      state.deposits[tokenSymbol][txIndex].status = status;
    }
    state.forceUpdateTick++;
  },
  setWithdrawalTx(state: TransactionModuleState, { tx, ethTx }: { tx: string; ethTx: string }): void {
    state.withdrawalTxToEthTx.set(tx, ethTx);
  },
});

export const getters = getterTree(state, {
  getForceUpdateTick: (state: TransactionModuleState): number => {
    return state.forceUpdateTick;
  },
  depositList: (state: TransactionModuleState): ZkInDeposits => {
    return state.deposits;
  },
  getWithdrawalTx(state: TransactionModuleState) {
    return (tx: string) => {
      return state.withdrawalTxToEthTx.get(tx);
    };
  },
});

export const actions = actionTree(
  { state, getters, mutations },
  {
    async watchTransaction({ commit, dispatch, state }, { transactionHash }): Promise<void> {
      try {
        const savedAddress = this.app.$accessor.account.address;
        if (Object.prototype.hasOwnProperty.call(state.watchedTransactions, transactionHash)) {
          return;
        }
        await walletData.get().syncProvider?.notifyTransaction(transactionHash, "COMMIT");
        if (savedAddress !== this.app.$accessor.account.address) {
          return;
        }
        commit("updateTransactionStatus", { hash: transactionHash, status: "Committed" });
        await dispatch("requestBalancesUpdate");
      } catch (error) {
        console.log("watchTransaction error", error);
      }
      commit("updateTransactionStatus", { hash: transactionHash, status: "Verified" });
    },
    async watchDeposit({ commit }, { depositTx, tokenSymbol, amount }: { depositTx: ETHOperation; tokenSymbol: TokenSymbol; amount: GweiBalance }): Promise<void> {
      try {
        const savedAddress = this.app.$accessor.account.address;
        commit("updateDepositStatus", { hash: depositTx.ethTx.hash, tokenSymbol, amount, status: "Initiated", confirmations: 1 });
        await depositTx.awaitReceipt();
        if (savedAddress !== this.app.$accessor.account.address) {
          return;
        }
        await this.app.$accessor.transaction.requestBalancesUpdate();
        commit("updateDepositStatus", { hash: depositTx.ethTx.hash, tokenSymbol, status: "Committed" });
      } catch (error) {
        commit("updateDepositStatus", { hash: depositTx.ethTx.hash, tokenSymbol, status: "Committed" });
      }
    },
    async requestBalancesUpdate(): Promise<void> {
      await this.app.$accessor.wallet.requestZkBalances({ force: true });
      await this.app.$accessor.wallet.requestTransactionsHistory({ offset: 0, force: true });
    },

    /**
     * Receive correct Fee amount
     * @param state
     * @param _
     * @param address
     * @param feeToken
     * @return {Promise<any>}
     */
    async fetchChangePubKeyFee(_, { address, feeToken }: { address: Address; feeToken: TokenSymbol }): Promise<Fee | undefined> {
      const syncWallet = walletData.get().syncWallet;
      const syncProvider = walletData.get().syncProvider;
      if (syncWallet?.ethSignerType?.verificationMethod === "ERC-1271") {
        const isOnchainAuthSigningKeySet = await syncWallet?.isOnchainAuthSigningKeySet();
        if (!isOnchainAuthSigningKeySet) {
          const onchainAuthTransaction = await syncWallet?.onchainAuthSigningKey();
          await onchainAuthTransaction?.wait();
        }
      }

      const ethAuthType = syncWallet?.ethSignerType?.verificationMethod === "ERC-1271" ? "Onchain" : "ECDSA";
      const txType: ChangePubKeyFee = {
        // Note: Ignore, since it just looks more intuitive if `"ChangePubKey"` is kept as a string literal)
        // Denotes how authorization of operation is performed:
        // 'Onchain' if it's done by sending an Ethereum transaction,
        // 'ECDSA' if it's done by providing an Ethereum signature in zkSync transaction.
        // 'CREATE2' if it's done by providing arguments to restore account ethereum address according to CREATE2 specification.
        ChangePubKey: <ChangePubkeyTypes>(ethAuthType === "ECDSA" ? "ECDSALegacyMessage" : "ECDSA"),
      };

      return syncProvider?.getTransactionFee(txType, address, feeToken);
    },

    /**
     * Getting the list of pending transactions to update balances status
     * @param state
     * @return {ZkInBalancesList}
     */
    getActiveDeposits({ getters }): ZkInBalancesList {
      // @ts-ignore
      getters.getForceUpdateTick; // Force to update the list
      const deposits: ZkInDeposits = getters.depositList;
      const activeDeposits: ZkInDeposits = {};
      const finalDeposits: ZkInBalancesList = {};
      let ticker: TokenSymbol;
      for (ticker in deposits) {
        activeDeposits[ticker] = deposits[ticker].filter((tx: ZKInDepositTx) => tx.status === "Initiated");
      }
      for (ticker in activeDeposits) {
        if (activeDeposits[ticker].length > 0) {
          if (!finalDeposits[ticker]) {
            finalDeposits[ticker] = BigNumber.from("0");
          }
          let tx: ZKInDepositTx;
          for (tx of activeDeposits[ticker]) {
            finalDeposits[ticker] = finalDeposits[ticker].add(tx.amount);
          }
        }
      }
      return finalDeposits;
    },
  },
);
