import { GetterTree, ActionTree, MutationTree } from 'vuex';

export const state = () => ({
  accountModalOpened: false,
  /**
   * Used to handle modals and simplify the code
   */
  currentModal: false as (String | false),
});

export type RootState = ReturnType<typeof state>

export const getters: GetterTree<RootState, RootState> = {
  getAccountModalState(state) {
    return state.accountModalOpened;
  },
  currentModal(state) {
    return state.currentModal;
  },
}

export const mutations: MutationTree<RootState> = {
  setAccountModalState(state, modalState: boolean) {
    state.accountModalOpened = !!modalState;
  },
  setCurrentModal(state, modalName: String) {
    state.currentModal = modalName;
  },
}

export const actions: ActionTree<RootState, RootState> = {
  openModal({ commit }, modalName) {
    commit("setCurrentModal", modalName);
  },
  closeActiveModal({ commit }) {
    commit("setCurrentModal", null);
  },
}
