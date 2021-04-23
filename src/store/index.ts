import { actionTree, getAccessorType, getterTree, mutationTree } from "typed-vuex";

import * as account from "@/store/account";
import * as contacts from "@/store/contacts";
import * as tokens from "@/store/tokens";
import * as transaction from "@/store/transaction";
import * as wallet from "@/store/wallet";

interface iRootState {
  accountModalOpened: boolean;
  currentModal?: string;
}

export const state = (): iRootState => ({
  accountModalOpened: false,
  currentModal: undefined,
});

export type RootState = ReturnType<typeof state>;

export const getters = getterTree(state, {
  getAccountModalState: (state: RootState) => state.accountModalOpened,
  currentModal: (state: RootState) => state.currentModal,
});

export const mutations = mutationTree(state, {
  setAccountModalState(state: RootState, modalState: boolean): void {
    state.accountModalOpened = modalState;
  },
  setCurrentModal(state: RootState, modalName: string): void {
    state.currentModal = modalName;
  },
  removeCurrentModal(state: RootState): void {
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
    account,
    contacts,
    tokens,
    transaction,
    wallet,
  },
});
