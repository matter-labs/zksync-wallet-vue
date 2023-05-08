/* eslint-disable require-await */
import type { GetterTree, MutationTree, ActionTree } from "vuex";
import { Address, AccountState as WalletAccountState, Tokens, AccountState } from "zksync/build/types";
import { Wallet, RemoteWallet } from "zksync";
import { ModuleOptions } from "@/types/zksync";

let accountStatePromise: Promise<WalletAccountState> | undefined;
let updateAccountStateInterval: ReturnType<typeof setInterval>;

export type AccountStateStore = {
  loggedIn: boolean;
  address?: Address;
  name?: string;
  accountState?: AccountState;
  accountStateLoading: boolean;
  accountStateRequested: boolean;
};

export const state = (_: ModuleOptions): AccountStateStore => ({
  loggedIn: false,
  address: undefined,
  name: undefined,
  accountState: undefined,
  accountStateLoading: false,
  accountStateRequested: false,
});

export const getters: GetterTree<AccountStateStore, AccountStateStore> = {
  loggedIn: (state) => state.loggedIn,
  address: (state) => state.address,
  name: (state) => state.name,
  accountState: (state) => state.accountState,
  accountStateLoading: (state) => state.accountStateLoading,
  accountStateRequested: (state) => state.accountStateRequested,
};

export const mutations: MutationTree<AccountStateStore> = {
  setLoggedIn: (state, loggedInState: boolean) => (state.loggedIn = loggedInState),
  setAddress: (state, address: Address) => (state.address = address),
  setName: (state, name: string) => (state.name = name),
  setAccountState: (state, accountState: AccountState) => (state.accountState = accountState),
  setAccountStateLoading: (state, status: boolean) => (state.accountStateLoading = status),
  setAccountStateRequested: (state, status: boolean) => (state.accountStateRequested = status),
  clear: (state) => {
    state.loggedIn = false;
    state.address = undefined;
    state.name = undefined;
    state.accountState = undefined;
    state.accountStateLoading = false;
    state.accountStateRequested = false;
    accountStatePromise = undefined;
    clearInterval(updateAccountStateInterval);
  },
};

export const actions: ActionTree<AccountStateStore, AccountStateStore> = {
  async setInitialName({ getters, commit, dispatch }) {
    const localStorageName = await dispatch("zk-contacts/getAddressName", getters.address, { root: true });
    if (localStorageName && typeof localStorageName === "string" && localStorageName.length > 0) {
      commit("setName", localStorageName);
    } else {
      commit("setName", getters.address.substr(0, 5) + "..." + getters.address.substr(getters.address.length - 5, getters.address.length - 1));
    }
  },
  async saveAccountName({ getters, commit, dispatch }, name: string) {
    const saved = await dispatch("zk-contacts/setAddressName", { name, address: getters.address }, { root: true });
    if (!saved) {
      dispatch("setInitialName");
    } else {
      commit("setName", name.trim());
    }
  },
  async updateAccountState({ getters, commit, dispatch, rootGetters }, force = false) {
    if (!rootGetters["zk-account/loggedIn"]) return;
    commit("setAccountStateLoading", true);
    try {
      const initialAddress = rootGetters["zk-account/address"];
      const syncWallet: Wallet | RemoteWallet = rootGetters["zk-wallet/syncWallet"];
      if (!accountStatePromise || force) {
        accountStatePromise = syncWallet.getAccountState();
      }
      const accountState = await accountStatePromise;
      const sortedAccountState = JSON.parse(JSON.stringify(accountState));
      const tokens: Tokens = await dispatch("zk-tokens/loadZkTokens", null, { root: true });
      sortedAccountState.committed.balances = Object.fromEntries(
        Object.entries(accountState.committed.balances).sort(([symbolA], [symbolB]) => tokens[symbolA]?.id - tokens[symbolB]?.id),
      );
      if (rootGetters["zk-account/loggedIn"] && initialAddress === rootGetters["zk-account/address"]) {
        commit("setAccountState", sortedAccountState);
        commit("setAccountStateRequested", true);
        if (rootGetters["zk-wallet/cpk"] !== true) {
          dispatch("zk-wallet/checkCPK", null, { root: true });
        }
      }
    } catch (error) {
      console.warn("Error updating account state\n", error);
    }
    accountStatePromise = undefined;
    commit("setAccountStateLoading", false);
    return getters.accountState;
  },
  async autoUpdateAccountState({ dispatch }, timeGap) {
    clearInterval(updateAccountStateInterval);
    updateAccountStateInterval = setInterval(() => {
      dispatch("updateAccountState");
    }, timeGap);
  },
  async clearAccountData({ commit }) {
    commit("clear");
    commit("zk-contacts/clear", null, { root: true });
    commit("zk-wallet/clear", null, { root: true });
    commit("zk-balances/clear", null, { root: true });
    commit("zk-history/clear", null, { root: true });
    commit("zk-transaction/clear", null, { root: true });
  },
  async logout({ commit, dispatch }) {
    commit("clear");
    commit("zk-contacts/clear", null, { root: true });
    commit("zk-wallet/clear", null, { root: true });
    commit("zk-balances/clear", null, { root: true });
    commit("zk-history/clear", null, { root: true });
    commit("zk-transaction/clear", null, { root: true });
    commit("zk-onboard/clear", null, { root: true });
    localStorage.removeItem("walletconnect");
    await dispatch("zk-onboard/reset", null, { root: true });
  },
};

export default () => ({
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
});
