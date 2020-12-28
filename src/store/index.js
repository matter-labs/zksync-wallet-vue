export const state = () => ({
  accountModalOpened: false,
});

export const mutations = {
  setAccountModalState(state, modalState) {
    state.accountModalOpened = !!modalState;
  },
};

export const getters = {
  getAccountModalState(state) {
    return state.accountModalOpened;
  },
};

export const actions = {};
