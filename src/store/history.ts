/* eslint-disable require-await */
// @ts-ignore
import cache from "js-cache";
import type { GetterTree, MutationTree, ActionTree } from "vuex";
import { Address, ApiTransaction, TokenSymbol } from "zksync/build/types";
import { RestProvider } from "zksync";
import { ModuleOptions, ZkTransactionHistoryLoadingState, ZkWithdrawalEthTxs, ZkFilteredTransactionHistory } from "@/types/zksync";

const withdrawalEthTxPromise: {
  [zkSyncHash: string]: Promise<string>;
} = {};

export type TransactionHistoryState = {
  transactionHistory: ApiTransaction[];
  transactionHistoryRequested: boolean;
  transactionHistoryLoading: ZkTransactionHistoryLoadingState;
  transactionHistoryAllLoaded: boolean;
  withdrawalEthTxHashes: ZkWithdrawalEthTxs;
};

export const state = (_: ModuleOptions): TransactionHistoryState => ({
  transactionHistory: [],
  transactionHistoryRequested: false,
  transactionHistoryLoading: false,
  transactionHistoryAllLoaded: false,
  withdrawalEthTxHashes: {},
});

export const getters: GetterTree<TransactionHistoryState, TransactionHistoryState> = {
  transactionHistory: (state) => state.transactionHistory,
  transactionHistoryRequested: (state) => state.transactionHistoryRequested,
  transactionHistoryLoading: (state) => state.transactionHistoryLoading,
  transactionHistoryAllLoaded: (state) => state.transactionHistoryAllLoaded,
  withdrawalEthTxHashes: (state) => state.withdrawalEthTxHashes,
};

export const mutations: MutationTree<TransactionHistoryState> = {
  setTransactionHistory: (state, transactions: ApiTransaction[]) => (state.transactionHistory = transactions),
  setTransactionHistoryRequested: (state, status: boolean) => (state.transactionHistoryRequested = status),
  addTransactionsToHistory: (state, transactions: ApiTransaction[]) => state.transactionHistory.push(...transactions),
  setTransactionHistoryLoading: (state, status: ZkTransactionHistoryLoadingState) => (state.transactionHistoryLoading = status),
  setTransactionHistoryAllLoaded: (state, status: boolean) => (state.transactionHistoryAllLoaded = status),
  setWithdrawalEthTxHashes: (state, withdrawalEthTxHashes: ZkWithdrawalEthTxs) => (state.withdrawalEthTxHashes = withdrawalEthTxHashes),
  setWithdrawalEthTxHash: (state, { zkSyncTxHash, withdrawalEthTxHash }) => (state.withdrawalEthTxHashes[zkSyncTxHash] = withdrawalEthTxHash),
  clear: (state) => {
    state.transactionHistory = [];
    state.transactionHistoryRequested = false;
    state.transactionHistoryLoading = false;
    state.transactionHistoryAllLoaded = false;
    cache.del("transactionHistoryRequested");
  },
};

export const actions: ActionTree<TransactionHistoryState, TransactionHistoryState> = {
  async getTransactionHistory({ getters, commit, dispatch, rootGetters }) {
    if (getters.transactionHistoryLoading === true) {
      return;
    }
    commit("setTransactionHistoryLoading", "main");
    try {
      const syncProvider: RestProvider = await dispatch("zk-provider/requestProvider", null, { root: true });
      const transactions = await syncProvider.accountTxs(rootGetters["zk-account/address"], {
        from: "latest",
        limit: 20,
        direction: "older",
      });
      if (transactions.list.length < 20) {
        commit("setTransactionHistoryAllLoaded", true);
      }
      commit("setTransactionHistory", transactions.list);
      commit("setTransactionHistoryRequested", true);
      cache.set("transactionHistoryRequested", true, 15000);
    } catch (error) {
      console.warn("Error getting transaction history\n", error);
    }
    commit("setTransactionHistoryLoading", false);
  },
  async getPreviousTransactionHistory({ getters, commit, dispatch, rootGetters }) {
    if (getters.transactionHistory.length === 0 || getters.transactionHistoryLoading === true) {
      return;
    }
    commit("setTransactionHistoryLoading", "previous");
    try {
      const syncProvider: RestProvider = await dispatch("zk-provider/requestProvider", null, { root: true });
      const transactions = await syncProvider.accountTxs(rootGetters["zk-account/address"], {
        from: (<ApiTransaction>getters.transactionHistory[getters.transactionHistory.length - 1]).txHash,
        limit: 21,
        direction: "older",
      });
      if (transactions.list.length < 21) {
        commit("setTransactionHistoryAllLoaded", true);
      }
      commit("addTransactionsToHistory", transactions.list.splice(1, transactions.list.length));
    } catch (error) {
      console.warn("Error getting previous transaction history\n", error);
    }
    commit("setTransactionHistoryLoading", false);
  },
  async getNewTransactionHistory({ getters, commit, dispatch, rootGetters }, force = false) {
    if (getters.transactionHistoryLoading === true) {
      return;
    }
    if (!cache.get("transactionHistoryRequested") || force) {
      commit("setTransactionHistoryLoading", "new");
      try {
        const syncProvider: RestProvider = await dispatch("zk-provider/requestProvider", null, { root: true });
        const transactions = await syncProvider.accountTxs(rootGetters["zk-account/address"], {
          from: "latest",
          limit: 20,
          direction: "older",
        });
        const newTransactionHashes = new Set(transactions.list.map((e) => e.txHash));
        const previousTransactions: ApiTransaction[] = JSON.parse(JSON.stringify(getters.transactionHistory));
        for (let a = previousTransactions.length - 1; a >= 0; a--) {
          if (newTransactionHashes.has(previousTransactions[a].txHash)) {
            previousTransactions.splice(a, 1);
          }
        }
        commit("setTransactionHistory", [...transactions.list, ...previousTransactions]);
        cache.set("transactionHistoryRequested", true, 15000);
      } catch (error) {
        console.warn("Error getting transaction history\n", error);
      }
      commit("setTransactionHistoryLoading", false);
    }
  },
  async getWithdrawalEthTxHash({ getters, commit, dispatch }, zkSyncTxHash: string) {
    if (getters.withdrawalEthTxHashes[zkSyncTxHash]) {
      return getters.withdrawalEthTxHashes[zkSyncTxHash];
    }
    try {
      const syncProvider: RestProvider = await dispatch("zk-provider/requestProvider", null, { root: true });
      if (!withdrawalEthTxPromise[zkSyncTxHash]) {
        withdrawalEthTxPromise[zkSyncTxHash] = syncProvider.getEthTxForWithdrawal(zkSyncTxHash);
      }
      const withdrawalEthTxHash = await withdrawalEthTxPromise[zkSyncTxHash];
      if (withdrawalEthTxHash) {
        commit("setWithdrawalEthTxHash", { zkSyncTxHash, withdrawalEthTxHash });
      }
      delete withdrawalEthTxPromise[zkSyncTxHash];
      return withdrawalEthTxHash;
    } catch (error) {
      delete withdrawalEthTxPromise[zkSyncTxHash];
      console.warn("Error getting withdrawal ethereum tx\n", error);
    }
  },
  async getFilteredTransactionHistory(
    { dispatch, rootGetters },
    { lastTxHash, token, address }: { lastTxHash?: string; token?: TokenSymbol; address?: Address },
  ): Promise<ZkFilteredTransactionHistory> {
    try {
      const syncProvider: RestProvider = await dispatch("zk-provider/requestProvider", null, { root: true });
      const transactions = await syncProvider.accountTxs(
        rootGetters["zk-account/address"],
        {
          from: lastTxHash || "latest",
          limit: 20,
          direction: "older",
        },
        token,
        address,
      );
      return {
        allLoaded: transactions.list.length < 20,
        transactions: lastTxHash ? transactions.list.splice(1, transactions.list.length) : transactions.list,
        error: false,
      };
    } catch (error) {
      console.warn("Error getting filtered transaction history\n", error);
    }
    return {
      transactions: [],
      allLoaded: false,
      error: true,
    };
  },
};

export default () => ({
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
});
