import { GetterTree, MutationTree } from "vuex";
import { Address } from "@/plugins/types";
import { RootState } from "~/store";

export const state = () => ({
  loggedIn: false,
  selectedWallet: "" as String,
  loadingHint: "" as String,
  address: "" as Address,
  name: "" as string,
});

function getNameFromAddress(userAddress: Address) {
  const walletName: string = window.localStorage.getItem(userAddress) || "";
  if (!walletName || walletName === userAddress) {
    let address: string = userAddress;
    if (address.length > 16) {
      address = address.substr(0, 5) + "..." + address.substr(address.length - 5, address.length - 1);
    }
    return address;
  } else {
    return walletName;
  }
}

export type AccountModuleState = ReturnType<typeof state>;

export const mutations: MutationTree<AccountModuleState> = {
  setLoggedIn(state, loggedInState: boolean) {
    state.loggedIn = loggedInState;
  },
  setSelectedWallet(state, name: String) {
    state.selectedWallet = name;
  },
  setLoadingHint(state, text: String) {
    state.loadingHint = text;
  },
  setAddress(state, address: Address) {
    state.address = address;
  },
  setName(state, name: string) {
    window.localStorage.setItem(state.address, name);
    state.name = getNameFromAddress(state.address);
  },
  setNameFromStorage(state) {
    state.name = getNameFromAddress(state.address);
  },
};

export const getters: GetterTree<AccountModuleState, RootState> = {
  loggedIn(state): boolean {
    return state.loggedIn;
  },
  selectedWallet(state): String {
    return state.selectedWallet;
  },
  loadingHint(state): String {
    return state.loadingHint;
  },
  loader(state): boolean {
    return !state.loggedIn && state.selectedWallet !== "";
  },
  address(state): Address {
    return state.address;
  },
  name(state): String {
    return state.name;
  },
};
