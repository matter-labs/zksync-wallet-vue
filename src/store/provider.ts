/* eslint-disable require-await */
// @ts-ignore
import cache from "js-cache";
import type { GetterTree, MutationTree, ActionTree } from "vuex";
import { getDefaultRestProvider, RestProvider } from "zksync";
import { Network } from "zksync/build/types";
import { ModuleOptions, ZkEthereumNetworkName } from "@/types/zksync";

let providerPromise: Promise<RestProvider> | undefined;
let syncProvider: RestProvider | undefined;

export type ProviderState = {
  network: Network;
  providerRequestingError: string | undefined;
  forceUpdateValue: number;
};

export const state = (options: ModuleOptions): ProviderState => ({
  network: options.network!,
  providerRequestingError: undefined,
  forceUpdateValue: Number.MIN_SAFE_INTEGER,
});

export const getters: GetterTree<ProviderState, ProviderState> = {
  network: (state) => state.network,
  providerRequestingError: (state) => state.providerRequestingError,
  syncProvider: (state) => {
    // eslint-disable-next-line no-unused-expressions
    state.forceUpdateValue;
    return syncProvider;
  },
};

export const mutations: MutationTree<ProviderState> = {
  setNetwork: (state, network: Network) => (state.network = network),
  setProviderRequestingError: (state, providerRequestingError: string | undefined) => (state.providerRequestingError = providerRequestingError),
  setSyncProvider: (state, provider: RestProvider | undefined) => {
    state.forceUpdateValue++;
    syncProvider = provider;
  },
  // clear: () => (),
};

export const actions: ActionTree<ProviderState, ProviderState> = {
  async requestProvider({ getters, commit }, force = false) {
    try {
      if (!syncProvider || force) {
        providerPromise = getDefaultRestProvider(getters.network);
      }
      const newSyncProvider = await providerPromise;
      commit("setSyncProvider", newSyncProvider);
      commit("setProviderRequestingError", undefined);
    } catch (error) {
      providerPromise = undefined;
      commit("setSyncProvider", undefined);
      commit("setProviderRequestingError", error);
      console.warn("Error requesting zkSync provider\n", error);
      throw error;
    }
    return syncProvider;
  },
  async changeNetwork({ commit, dispatch, rootGetters }, networkName: ZkEthereumNetworkName) {
    commit("zk-onboard/setLoadingHint", "Switching networks...", { root: true });
    commit("zk-onboard/setOnboardStatus", "connecting", { root: true });
    commit("setNetwork", networkName);
    if (rootGetters["zk-onboard/options"].restoreNetwork) {
      localStorage.setItem("lastSelectedNetwork", networkName);
    }
    cache.clear();
    try {
      await dispatch("requestProvider", true);
    } catch (error) {
      if (rootGetters["zk-account/loggedIn"]) {
        console.log("Error requesting provider while changing the network. Logging the user out...");
        dispatch("zk-account/logout", null, { root: true });
      }
      return;
    }
    commit("zk-tokens/clear", null, { root: true });
    dispatch("zk-tokens/loadZkTokens", true, { root: true });
    if (rootGetters["zk-account/loggedIn"]) {
      await dispatch("zk-account/clearAccountData", null, { root: true });
      if (rootGetters["zk-onboard/selectedWallet"] === "Argent") {
        await dispatch("zk-onboard/loginWithWC1", undefined, { root: true });
      } else {
        await dispatch("zk-onboard/loginWithOnboard", rootGetters["zk-onboard/selectedWallet"], { root: true });
      }
    } else {
      commit("zk-onboard/setOnboardStatus", "initial", { root: true });
    }
  },
};

export default (options: ModuleOptions) => ({
  namespaced: true,
  state: state(options),
  getters,
  mutations,
  actions,
});
