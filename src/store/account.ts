import { Address } from "@/plugins/types";
import { actionTree, getterTree, mutationTree } from "typed-vuex/lib";
import { Wallet } from "zksync/build";
import { APP_ZK_SCAN } from "~/plugins/build";

export const state = () => ({
  loggedIn: false,
  selectedWallet: "",
  loadingHint: "",
  address: "" as Address,
  name: "",
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
  setLoggedIn(state, loggedInState: boolean) {
    state.loggedIn = loggedInState;
  },
  setSelectedWallet(state, name: string) {
    state.selectedWallet = name;
  },
  setLoadingHint(state, text: string) {
    state.loadingHint = text;
  },
  setAddress(state, address: Address) {
    state.address = address;
  },
  setName(state: AccountModuleState, name: string) {
    if (name.length < 1) {
      name = getNameFromAddress(state.address);
    }
    window.localStorage.setItem(state.address, name);
    state.name = getNameFromAddress(state.address);
  },
  setNameFromStorage(state) {
    state.name = getNameFromAddress(state.address);
  },
});

export const getters = getterTree(state, {
  loggedIn(state): boolean {
    return state.loggedIn;
  },
  selectedWallet(state): string {
    return state.selectedWallet;
  },
  loadingHint(state): string {
    return state.loadingHint;
  },
  loader(state): boolean {
    return !state.loggedIn && state.selectedWallet !== "";
  },
  address(state): Address {
    return state.address;
  },
  name(state): string {
    return state.name;
  },
  zkScanUrl(state: AccountModuleState): string {
    return `${APP_ZK_SCAN}/accounts/${state.address}`;
  },
});

export const actions = actionTree(
  { state, getters, mutations },
  {
    storeConnection({ commit }, wallet: Wallet): void {
      commit("setSelectedWallet", wallet.address());
      commit("setLoggedIn", true);
    },
  },
);
