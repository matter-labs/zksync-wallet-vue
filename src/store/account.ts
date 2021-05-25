import { getterTree, mutationTree } from "typed-vuex";
import { Address } from "zksync/build/types";
import { APP_ZK_SCAN } from "@/plugins/build";

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
  setLoggedIn(state, loggedInState: boolean): void {
    state.loggedIn = loggedInState;
  },
  setSelectedWallet(state, name: string): void {
    state.selectedWallet = name;
  },
  setLoadingHint(state, text: string): void {
    state.loadingHint = text;
  },
  setAddress(state, address: Address): void {
    state.address = address;
  },
  setName(state, name: string): void {
    if (state.address !== undefined) {
      if (name.length < 1) {
        name = getNameFromAddress(state.address);
        window.localStorage.removeItem(state.address);
      }
      window.localStorage.setItem(state.address, name);
      state.name = getNameFromAddress(state.address);
    }
  },
  setNameFromStorage(state): void {
    if (state.address !== undefined) {
      state.name = getNameFromAddress(state.address);
    }
  },
});

export const getters = getterTree(state, {
  loggedIn: (state): boolean => state.loggedIn,
  selectedWallet: (state): string | undefined => state.selectedWallet,
  loadingHint: (state): string => state.loadingHint,
  loader: (state): boolean => !state.loggedIn && state.selectedWallet !== "",
  address: (state): Address | undefined => state.address,
  name: (state): string | undefined => state.name,
  zkScanUrl: (state): string | undefined => (state.address ? `${APP_ZK_SCAN}/accounts/${state.address}` : undefined),
});
