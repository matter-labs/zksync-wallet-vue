import * as provider from "@/store/provider";
import * as contacts from "@/store/contacts";
import * as tokens from "@/store/tokens";
import * as transaction from "@/store/transaction";
import * as wallet from "@/store/wallet";
import { ZKIRootState } from "@/types/lib";
import { actionTree, getAccessorType, getterTree, mutationTree } from "typed-vuex";
import { Route } from "vue-router/types";

export const state = () =>
  <ZKIRootState>{
    accountModalOpened: false,
    currentModal: <string | undefined>undefined,
    previousRoute: <Route | undefined>undefined,
  };

export type RootState = ReturnType<typeof state>;

export const getters = getterTree(state, {
  getAccountModalState: (state) => state.accountModalOpened,
  getPreviousRoute: (state) => state.previousRoute,
  currentModal: (state) => state.currentModal,
});

export const mutations = mutationTree(state, {
  setAccountModalState(state, modalState: boolean) {
    state.accountModalOpened = modalState;
  },
  setCurrentModal(state, modalName: string) {
    state.currentModal = modalName;
  },
  setPreviousRoute(state, route: Route) {
    state.previousRoute = route;
  },
  removeCurrentModal(state) {
    state.currentModal = undefined;
  },
});

export const actions = actionTree(
  { state, getters, mutations },
  {
    openModal({ commit }, modalName: string): void {
      commit("setCurrentModal", modalName);
    },
    closeActiveModal({ commit }): void {
      commit("removeCurrentModal");
    },
  },
);

export const accessorType = getAccessorType({
  state,
  getters,
  mutations,
  actions,
  modules: {
    provider,
    contacts,
    tokens,
    transaction,
    wallet,
  },
});
