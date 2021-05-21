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
  errorsSpotted: false,
});

export type AccountModuleState = ReturnType<typeof state>;

export const getters = getterTree(state, {
  loggedIn: (state): boolean => state.loggedIn,
  previouslySelectedWallet: (state): string | undefined => state.selectedWallet,
  loadingHint: (state): string | undefined => state.loadingHint,
  loader: (state): boolean => !state.loggedIn && state.selectedWallet !== "",
  address: (state): Address | undefined => state.address,
  name: (state): string | undefined => state.name,
  anyNetworkErrorsRegistered: (state): boolean => state.errorsSpotted,
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
  processError(state, clear: boolean = false): void {
    state.errorsSpotted = !clear;
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

    reportState({ commit }, wasError: boolean = false): void {
      commit("processError", wasError);
    },

    logout({ commit }): void {
      commit("clearAll");
    },

    clearSelectedWallet({ commit }): void {
      commit("storeWallet", undefined);
      window.localStorage.removeItem("selectedWallet");
    },

    checkPreviouslySelectedWallet({ commit, state }): string | undefined {
      if (!state.selectedWallet) {
        const walletStored: string | null = window.localStorage.getItem("selectedWallet");
        if (walletStored) {
          this.app.$accessor.account.setSelectedWallet(walletStored);
        }
      }
      return state.selectedWallet;
    },

    setSelectedWallet({ commit }, name: string | undefined): void {
      commit("storeWallet", name);
      window.localStorage.setItem("selectedWallet", name as string);
    },
    setNameFromStorage({ state, commit }): string | undefined {
      if (state.address !== undefined) {
        return commit("storeNameFromAddress", state.address);
      }
      return undefined;
    },
  },
);
