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
  setLoggedIn(state: AccountModuleState, loggedInState: boolean): void {
    state.loggedIn = loggedInState;
  },
  setSelectedWallet(state: AccountModuleState, name: string): void {
    state.selectedWallet = name;
  },
  setLoadingHint(state: AccountModuleState, text: string): void {
    state.loadingHint = text;
  },
  setAddress(state: AccountModuleState, address: Address): void {
    state.address = address;
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
  setNameFromStorage(state: AccountModuleState): void {
    if (state.address !== undefined) {
      state.name = getNameFromAddress(state.address);
    }
  },
});

export const getters = getterTree(state, {
  loggedIn: (state: AccountModuleState): boolean => state.loggedIn,
  selectedWallet: (state: AccountModuleState): string | undefined => state.selectedWallet,
  loadingHint: (state: AccountModuleState): string => state.loadingHint,
  loader: (state: AccountModuleState): boolean => !state.loggedIn && state.selectedWallet !== "",
  address: (state: AccountModuleState): Address | undefined => state.address,
  name: (state: AccountModuleState): string | undefined => state.name,
  zkScanUrl: (state: AccountModuleState): string | undefined => (state.address ? `${APP_ZK_SCAN}/accounts/${state.address}` : undefined),
});
