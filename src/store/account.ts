import { APP_ZKSYNC_BLOCK_EXPLORER } from "@/plugins/build";
import { actionTree, getterTree, mutationTree } from "typed-vuex";
import { Address } from "zksync/build/types";

export declare interface iAccount {
  loggedIn: boolean;
  selectedWallet?: string;
  loadingHint: string;
  address?: Address;
  name?: string;
}

export const state = (): iAccount => ({
  loggedIn: false,
  selectedWallet: undefined,
  loadingHint: "",
  address: undefined,
  name: undefined,
});

function getNameFromAddress(userAddress: Address): string {
  const walletName: string = window.localStorage.getItem(userAddress) || "";
  if (walletName.trim().length > 1 && walletName !== userAddress) {
    return walletName;
  }
  return userAddress.substr(0, 5) + "..." + userAddress.substr(userAddress.length - 5, userAddress.length - 1);
}

export type AccountModuleState = ReturnType<typeof state>;

export const mutations = mutationTree(state, {
  setLoggedIn(state: AccountModuleState, isLoggedIn: boolean): void {
    state.loggedIn = isLoggedIn;
  },
  setSelectedWallet(state: AccountModuleState, name): void {
    if (name) {
      window.localStorage.setItem("selectedWallet", name as string);
    }
    state.selectedWallet = name;
  },
  setLoadingHint(state: AccountModuleState, text: string): void {
    state.loadingHint = text;
  },
  setAddress(state: AccountModuleState, address?: Address): void {
    state.address = address;
  },
  setName(state: AccountModuleState, name?: string): void {
    if (state.address !== undefined) {
      if (!name) {
        if (!state.name) {
          name = window.localStorage.getItem(state.address) as string;
        }
        name = getNameFromAddress(state.address);
        window.localStorage.removeItem(state.address);
      }
      window.localStorage.setItem(state.address, name);
      state.name = getNameFromAddress(state.address);
    }
  },
  clearDataStorage(state: AccountModuleState): void {
    state.loggedIn = false;
    state.selectedWallet = undefined;
    state.name = "";
    state.address = undefined;
  },
});

export const getters = getterTree(state, {
  loggedIn: (state: AccountModuleState): boolean => state.loggedIn,
  selectedWallet: (state: AccountModuleState): string | undefined => state.selectedWallet,
  loadingHint: (state: AccountModuleState): string => state.loadingHint,
  loader: (state: AccountModuleState): boolean => !state.loggedIn && !!state.selectedWallet,
  address: (state: AccountModuleState): Address | undefined => state.address,
  name: (state: AccountModuleState): string | undefined => state.name,
  zkScanUrl: (state: AccountModuleState): string | undefined => (state.address ? `${APP_ZKSYNC_BLOCK_EXPLORER}/accounts/${state.address}` : undefined),
});

export const actions = actionTree(
  { state, getters, mutations },
  {
    logout({ commit }): void {
      commit("clearDataStorage");
      this.app.$accessor.account.setWallet(undefined);
    },
    processLogin: ({ commit }, address?: Address | string) => {
      if (address) {
        commit("setAddress", address as Address);
        commit("setLoggedIn", true);
        commit("setName", undefined);
      }
    },
    setWallet: ({ commit }, selectedWallet?: string): void => {
      commit("setSelectedWallet", selectedWallet);
      if (selectedWallet) {
        window.localStorage.setItem("selectedWallet", selectedWallet as string);
      } else {
        window.localStorage.removeItem("selectedWallet");
      }
    },
    setWalletFromStorage(_str): string | undefined {
      const previouslySelectedWallet = window.localStorage.getItem("selectedWallet");
      console.log("wallet from storage", previouslySelectedWallet);
      if (previouslySelectedWallet) {
        this.app.$toast.show("Found previously selected wallet.");
        this.app.$accessor.account.setWallet(previouslySelectedWallet);
      }
      return previouslySelectedWallet || undefined;
    },
  },
);
