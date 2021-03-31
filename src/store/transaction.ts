import { ActionTree, GetterTree, MutationTree } from "vuex";
import { walletData } from "@/plugins/walletData";
import { ETHOperation } from "@/plugins/types";
import { RootState } from "~/store";

let updateBalancesTimeout = undefined as any;

interface depositsInterface {
  [tokenSymbol: string]: Array<{
    hash: string;
    amount: string;
    status: string;
    confirmations: number;
  }>;
}

export const state = () => ({
  watchedTransactions: {} as {
    [txHash: string]: {
      [prop: string]: string;
      status: string;
    };
  },
  deposits: {} as depositsInterface,
  forceUpdateTick: 0,
  withdrawalTxToEthTx: new Map() as Map<string, string>,
});

export type TransactionModuleState = ReturnType<typeof state>;

export const mutations: MutationTree<TransactionModuleState> = {
  updateTransactionStatus(state, { hash, status }): void {
    if (status === "Verified") {
      delete state.watchedTransactions[hash];
      return;
    }
    if (!state.watchedTransactions.hasOwnProperty(hash)) {
      state.watchedTransactions[hash] = {
        status,
      };
    } else {
      state.watchedTransactions[hash].status = status;
    }
  },
  updateDepositStatus(state, { tokenSymbol, hash, amount, status, confirmations }) {
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
      state.deposits[tokenSymbol].push({
        hash,
        amount,
        status,
        confirmations,
      });
      state.forceUpdateTick++;
    } else {
      state.deposits[tokenSymbol][txIndex].status = status;
      state.forceUpdateTick++;
    }
  },
  setWithdrawalTx(state, { tx, ethTx }) {
    state.withdrawalTxToEthTx.set(tx, ethTx);
  },
};

export const getters: GetterTree<TransactionModuleState, RootState> = {
  depositList(state) {
    return state.deposits;
  },
  getWithdrawalTx(state) {
    return (tx: string): string | undefined => {
      return state.withdrawalTxToEthTx.get(tx);
    };
  },
};

export const actions: ActionTree<TransactionModuleState, RootState> = {
  async watchTransaction({ dispatch, commit, state }, { transactionHash, existingTransaction /* , tokenSymbol, type */ }): Promise<void> {
    try {
      if (state.watchedTransactions.hasOwnProperty(transactionHash)) {
        return;
      }
      if (!existingTransaction) {
        await walletData.get().syncProvider!.notifyTransaction(transactionHash, "COMMIT");
        commit("updateTransactionStatus", { hash: transactionHash, status: "Committed" });
        dispatch("requestBalancesUpdate");
      } else {
        commit("updateTransactionStatus", { hash: transactionHash, status: "Committed" });
      }
      await walletData.get().syncProvider!.notifyTransaction(transactionHash, "VERIFY");
      commit("updateTransactionStatus", { hash: transactionHash, status: "Verified" });
      dispatch("requestBalancesUpdate");
    } catch (error) {
      commit("updateTransactionStatus", { hash: transactionHash, status: "Verified" });
    }
  },
  async watchDeposit({ dispatch, commit }, { depositTx, tokenSymbol, amount }: { depositTx: ETHOperation; tokenSymbol: string; amount: string }): Promise<void> {
    try {
      commit("updateDepositStatus", { hash: depositTx!.ethTx.hash, tokenSymbol, amount, status: "Initiated", confirmations: 1 });
      await depositTx.awaitEthereumTxCommit();
      dispatch("requestBalancesUpdate");
      await depositTx.awaitReceipt();
      dispatch("requestBalancesUpdate");
      commit("updateDepositStatus", { hash: depositTx!.ethTx.hash, tokenSymbol, status: "Committed" });
      await depositTx.awaitVerifyReceipt();
      dispatch("requestBalancesUpdate");
      commit("updateDepositStatus", { hash: depositTx!.ethTx.hash, tokenSymbol, status: "Verified" });
    } catch (error) {
      commit("updateDepositStatus", { hash: depositTx!.ethTx.hash, tokenSymbol, status: "Verified" });
    }
  },
  requestBalancesUpdate(): void {
    clearTimeout(updateBalancesTimeout);
    updateBalancesTimeout = setTimeout(() => {
      this.dispatch("wallet/getzkBalances", { accountState: undefined, force: true });
      this.dispatch("wallet/getTransactionsHistory", { offset: 0, force: true });
    }, 2000);
  },
};
