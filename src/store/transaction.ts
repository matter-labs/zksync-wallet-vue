import { walletData } from "@/plugins/walletData";
import { GweiBalance, ZKIDepositStatus, ZKInDepositTx, ZKITransactionsStore } from "@/types/lib";
import { ContractTransaction } from "ethers";
import { actionTree, getterTree, mutationTree } from "typed-vuex/lib";
import { Wallet } from "zksync";
import { Address, ChangePubKeyFee, ChangePubkeyTypes, Fee, TokenSymbol } from "zksync/build/types";
import { ETHOperation } from "zksync/build/wallet";

export const state = (): ZKITransactionsStore => ({
  watchedTransactions: {},
  deposits: {},
  forceUpdateTick: 0 /* Used to force update computed active deposits list */,
  withdrawalTxToEthTx: new Map(),
});

export type TransactionModuleState = ReturnType<typeof state>;

export const mutations = mutationTree(state, {
  updateTransactionStatus(state, { hash, status }: { hash: string; status: string }): void {
    if (status === "Verified") {
      delete state.watchedTransactions[hash];
      return;
    }
    state.watchedTransactions[hash].status = status;
  },
  updateDepositStatus(state, { tokenSymbol, hash, amount, status, confirmations }: ZKIDepositStatus): void {
    let txIndex = -1;
    for (let watchedIndex = 0; watchedIndex < state.deposits[tokenSymbol].length; watchedIndex++) {
      if (state.deposits[tokenSymbol][watchedIndex].hash === hash) {
        txIndex = watchedIndex;
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
  setWithdrawalTx(state: TransactionModuleState, { tx, ethTx }): void {
    state.withdrawalTxToEthTx.set(tx, ethTx);
  },
});

export const getters = getterTree(state, {
  getForceUpdateTick: (state): number => {
    return state.forceUpdateTick;
  },
  depositList(state) {
    return state.deposits;
  },
});

export const actions = actionTree(
  { state, getters, mutations },
  {
    async watchTransaction({ commit, dispatch, state }, transactionHash: string): Promise<void> {
      try {
        const savedAddress: Address | undefined = this.app.$accessor.account.address;
        if (Object.prototype.hasOwnProperty.call(state.watchedTransactions, transactionHash)) {
          return;
        }
        await walletData.get().syncProvider?.notifyTransaction(transactionHash, "COMMIT");
        if (savedAddress === this.app.$accessor.account.address) {
          commit("updateTransactionStatus", { hash: transactionHash, status: "Committed" });
        }
        await this.app.$accessor.transaction.requestBalancesUpdate();
      } catch (error) {
        this.$sentry?.captureException(error);
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
        commit("updateDepositStatus", <ZKIDepositStatus>{ hash: depositTx.ethTx.hash, tokenSymbol, status: "Committed" });
      } catch (error) {
        this.$sentry?.captureException(error);
        commit("updateDepositStatus", <ZKIDepositStatus>{ hash: depositTx.ethTx.hash, tokenSymbol, status: "Committed" });
      }
    },
    // @ts-ignore
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
     * @return {Promise<Fee | undefined>}
     */
    async fetchChangePubKeyFee(_, { address, feeToken }: { address: Address; feeToken: TokenSymbol }): Promise<Fee> {
      const syncWallet: Wallet | undefined = walletData.get().syncWallet;
      if (syncWallet?.ethSignerType?.verificationMethod === "ERC-1271") {
        const isOnchainAuthSigningKeySet: boolean = await syncWallet?.isOnchainAuthSigningKeySet();
        if (!isOnchainAuthSigningKeySet) {
          const onchainAuthTransaction: ContractTransaction = await syncWallet?.onchainAuthSigningKey();
          await onchainAuthTransaction.wait();
        }
      }

      const ethAuthType: string = syncWallet?.ethSignerType?.verificationMethod === "ERC-1271" ? "Onchain" : "ECDSA";
      const txType: ChangePubKeyFee = {
        // Note: Ignore, since it just looks more intuitive if `"ChangePubKey"` is kept as a string literal)
        // Denotes how authorization of operation is performed:
        // 'Onchain' if it's done by sending an Ethereum transaction,
        // 'ECDSA' if it's done by providing an Ethereum signature in zkSync transaction.
        // 'CREATE2' if it's done by providing arguments to restore account ethereum address according to CREATE2 specification.
        ChangePubKey: <ChangePubkeyTypes>(ethAuthType === "ECDSA" ? "ECDSALegacyMessage" : "ECDSA"),
      };

      return walletData.get().syncProvider!.getTransactionFee(txType, address, feeToken);
    },
    getWithdrawalTx({ state }, tx: string): string | undefined {
      return state.withdrawalTxToEthTx.get(tx);
    },
  },
);
