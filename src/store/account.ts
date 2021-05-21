import { APP_ZK_SCAN } from "@/plugins/build";
import { actionTree, getterTree, mutationTree } from "typed-vuex";
import { Address } from "zksync/build/types";
import { ZkIAccount } from "~/types/lib";

export const state = (): ZkIAccount => ({
  loggedIn: false,
  selectedWallet: undefined,
  loadingHint: "",
  address: undefined,
  name: undefined,
});

export type AccountModuleState = ReturnType<typeof state>;

export const getters = getterTree(state, {
  loggedIn: (state): boolean => state.loggedIn,
  selectedWallet: (state): string | undefined => state.selectedWallet,
  loadingHint: (state): string | undefined => state.loadingHint,
  loader: (state): boolean => !state.loggedIn && state.selectedWallet !== "",
  address: (state): Address | undefined => state.address,
  name: (state): string | undefined => state.name,
  zkScanUrl: (state): string | undefined => (state.address ? `${APP_ZK_SCAN}/accounts/${state.address}` : undefined),
});

export const mutations = mutationTree(state, {
  setLoggedIn(state, loggedInState: boolean): void {
    state.loggedIn = loggedInState;
  },
  storeWallet(state, walletName: string | undefined): void {
    state.selectedWallet = walletName;
  },
  setLoadingHint(state, text: string | undefined): void {
    state.loadingHint = text;
  },
  storeAddress(state, address: Address): void {
    state.address = address;
  },
  storeName(state, name: string): void {
    state.name;
  },
  clearAll(state): void {
    state.name = undefined;
    state.address = undefined;
    state.selectedWallet = undefined;
    state.loggedIn = false;
  },
  storeNameFromAddress(state, userAddress: Address): string {
    const walletName: string = window.localStorage.getItem(userAddress) || "";
    state.name =
      walletName.trim().length > 1 && walletName !== userAddress
        ? walletName
        : userAddress.substr(0, 5) + "..." + userAddress.substr(userAddress.length - 5, userAddress.length - 1);
    return state.name;
  },
});

export const actions = actionTree(
  { state, mutations, getters },
  {
    updateLoadingHint({ commit }, hintText: string): void {
      commit("setLoadingHint", hintText);
    },

    setAddress({ state, commit }, address: string): void {
      commit("storeAddress", address);
    },
    setName({ state, commit, dispatch }, name: string): void {
      if (state.address !== undefined) {
        if (name.length < 1) {
          name = commit("storeNameFromAddress", state.address);
        }
        window.localStorage.setItem(state.address, name);
      }
    },

    logout({ commit }): void {
      commit("clearAll");
    },

    setSelectedWallet({ commit }, name: string | undefined): void {
      commit("storeWallet", name);
    },
    setNameFromStorage({ state, commit }): string | undefined {
      if (state.address !== undefined) {
        return commit("storeNameFromAddress", state.address);
      }
      return undefined;
    },
  },
);
