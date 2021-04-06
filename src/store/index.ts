import { actionTree, getAccessorType, getterTree, mutationTree } from "typed-vuex";

import * as account from "@/store/account";
import * as contacts from "@/store/contacts";
import * as scroll from "@/store/scroll/index";
import * as toaster from "@/store/toaster";
import * as tokens from "@/store/tokens";
import * as transaction from "@/store/transaction";
import * as wallet from "@/store/wallet";

export const state = () => ({
  accountModalOpened: false,
  /**
   * Used to handle modals and simplify the code
   */
  currentModal: false as String | false,
});

export type RootState = ReturnType<typeof state>;

export const getters = getterTree(state, {
  getAccountModalState(state) {
    return state.accountModalOpened;
  },
  currentModal(state) {
    return state.currentModal;
  },
});

export const mutations = mutationTree(state, {
  setAccountModalState(state, modalState: boolean) {
    state.accountModalOpened = modalState;
  },
  setCurrentModal(state, modalName: String | false) {
    state.currentModal = modalName;
  },
});

export const actions = actionTree(
  { state, getters, mutations },
  {
    openModal({ commit }, modalName) {
      commit("setCurrentModal", modalName);
    },
    closeActiveModal({ commit }) {
      commit("setCurrentModal", false);
    },
  },
);

export const accessorType = getAccessorType({
  state,
  getters,
  mutations,
  actions,
  modules: {
    scroll,
    account,
    contacts,
    toaster,
    tokens,
    transaction,
    wallet,
  },
});
