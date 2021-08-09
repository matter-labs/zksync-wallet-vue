import { actionTree, getAccessorType, mutationTree } from "typed-vuex";
import { Route } from "vue-router/types";

import * as account from "@/store/account";
import * as contacts from "@/store/contacts";
import * as tokens from "@/store/tokens";
import * as transaction from "@/store/transaction";
import * as wallet from "@/store/wallet";

export const state = () => ({
  accountModalOpened: false,
  currentModal: null as string | null,
  previousRoute: null as Route | null,
});

export type RootState = ReturnType<typeof state>;

export const getters = {
  getAccountModalState: (state: RootState) => state.accountModalOpened,
  getPreviousRoute: (state: RootState) => state.previousRoute,
  currentModal: (state: RootState) => state.currentModal,
};

export const mutations = mutationTree(state, {
  setAccountModalState(state: RootState, modalState: boolean): void {
    state.accountModalOpened = modalState;
  },
  setCurrentModal(state: RootState, modalName: string | null): void {
    state.currentModal = modalName;
  },
  setPreviousRoute(state: RootState, route: Route): void {
    state.previousRoute = route;
  },
});

export const actions = actionTree(
  { state, getters, mutations },
  {
    openModal: ({ commit }, modalName: string) => {
      commit("setCurrentModal", modalName);
    },
    closeActiveModal: ({ commit }) => {
      commit("setCurrentModal", null);
    },
  },
);

export const accessorType = getAccessorType({
  actions,
  getters,
  mutations,
  state,
  modules: {
    account,
    contacts,
    tokens,
    transaction,
    wallet,
  },
});
