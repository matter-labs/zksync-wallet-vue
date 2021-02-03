import { GetterTree, MutationTree } from "vuex";
import { Address } from "@/plugins/types";
import { RootState } from "~/store";

export const state = () => ({
  loggedIn: false,
  selectedWallet: "" as String,
  loadingHint: "" as String,
  address: "" as Address,
});

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
};
