import { actionTree, getterTree, mutationTree } from "typed-vuex";
import { Address } from "zksync/build/types";
import { APP_ZKSYNC_BLOCK_EXPLORER } from "@/plugins/build";

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

export const getters = getterTree(state, {
  loggedIn: (state: AccountModuleState): boolean => state.loggedIn,
  selectedWallet: (state: AccountModuleState): string | undefined => state.selectedWallet,
  loadingHint: (state: AccountModuleState): string => state.loadingHint,
  loader: (state: AccountModuleState): boolean => !state.loggedIn && state.selectedWallet !== "",
  address: (state: AccountModuleState): Address | undefined => state.address,
  name: (state: AccountModuleState): string | undefined => state.name,
  zkScanUrl: (state: AccountModuleState): string | undefined => (state.address ? `${APP_ZKSYNC_BLOCK_EXPLORER}/accounts/${state.address}` : undefined),
});

export const mutations = mutationTree(state, {
  setSelectedWallet(state: AccountModuleState, name: string): void {
    if (name) {
      window.localStorage.setItem("selectedWallet", name as string);
    }
    state.selectedWallet = name;
  },
  setLoadingHint(state: AccountModuleState, text: string): void {
    state.loadingHint = text;
  },
  setAddress(state: AccountModuleState, address?: Address): void {
    if (address !== undefined) {
      state.address = address;
      state.name = getNameFromAddress(state.address);
      state.loggedIn = true;
    }
  },
  setName(state: AccountModuleState, name: string): void {
    if (state.address !== undefined) {
      if (name.length < 1) {
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
    state.loadingHint = "Logging out";
    state.name = undefined;
    state.address = undefined;
  },
});

export const actions = actionTree(
  { state, getters, mutations },
  {
    logout: ({ commit }) => {
      commit("clearDataStorage");
    },
    processLogin: ({ commit }, address?: Address) => {
      commit("setAddress", address);
    },
  },
);
