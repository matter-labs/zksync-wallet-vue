export const state = () => ({
  accountModalOpened: false,
  /**
   * Used to handle modals and simplify the code
   */
  currentModal: false,
});

export const mutations = {
  setAccountModalState(state, modalState) {
    state.accountModalOpened = !!modalState;
  },
  setCurrentModal(state, modalName) {
    state.currentModal = modalName;
  },
};

export const getters = {
  getAccountModalState(state) {
    return state.accountModalOpened;
  },
  currentModal(state) {
    return state.currentModal;
  },
};

export const actions = {
  openModal({ commit }, modalName) {
    commit("setCurrentModal", modalName);
  },
  closeActiveModal({ commit }) {
    commit("setCurrentModal", null);
  },
};
