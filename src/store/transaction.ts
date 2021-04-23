import { GweiBalance, ZkInDeposits, ZKInDepositTx } from "@/plugins/types";
import { walletData } from "@/plugins/walletData";
import { actionTree, getterTree, mutationTree } from "typed-vuex/lib";
import { ChangePubKeyFee, ChangePubkeyTypes, Fee, TokenSymbol, Address } from "zksync/build/types";
import { ETHOperation } from "zksync/build/wallet";

export const state = () => ({
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
});

export type TransactionModuleState = ReturnType<typeof state>;

export const mutations = mutationTree(state, {
  updateTransactionStatus(state, { hash, status }): void {
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
  updateDepositStatus: (state, { tokenSymbol, hash, amount, status, confirmations }) => {
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
  setWithdrawalTx(state: TransactionModuleState, { tx, ethTx }) {
    state.withdrawalTxToEthTx.set(tx, ethTx);
  },
});

export const getters = getterTree(state, {
  getForceUpdateTick(state) {
    return state.forceUpdateTick;
  },
  depositList(state) {
    return state.deposits;
  },
  getWithdrawalTx(state) {
    return (tx: string): string | undefined => {
      return state.withdrawalTxToEthTx.get(tx);
    };
  },
});

export const actions = actionTree(
  { state, getters, mutations },
  {
    async watchTransaction({ commit, dispatch, state }, { transactionHash, existingTransaction }) {
      try {
        if (Object.prototype.hasOwnProperty.call(state.watchedTransactions, transactionHash)) {
          return;
        }
        if (!existingTransaction) {
          walletData.get().syncProvider?.notifyTransaction(transactionHash, "COMMIT");
          commit("updateTransactionStatus", { hash: transactionHash, status: "Committed" });
          await dispatch("requestBalancesUpdate");
        } else {
          commit("updateTransactionStatus", { hash: transactionHash, status: "Committed" });
        }
        walletData.get().syncProvider?.notifyTransaction(transactionHash, "VERIFY");
        await dispatch("requestBalancesUpdate");
        commit("updateTransactionStatus", { hash: transactionHash, status: "Verified" });
      } catch (error) {
        commit("updateTransactionStatus", { hash: transactionHash, status: "Verified" });
      }
    },
    watchDeposit({ commit }, { depositTx, tokenSymbol, amount }: { depositTx: ETHOperation; tokenSymbol: TokenSymbol; amount: GweiBalance }) {
      try {
        commit("updateDepositStatus", { hash: depositTx.ethTx.hash, tokenSymbol, amount, status: "Initiated", confirmations: 1 });
        depositTx.awaitReceipt().then(async () => {
          await this.app.$accessor.transaction.requestBalancesUpdate();
          commit("updateDepositStatus", { hash: depositTx.ethTx.hash, tokenSymbol, status: "Committed" });
        });
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
  },
);
