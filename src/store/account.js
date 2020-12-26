export const state = () => ({
  loggedIn: false,
  selectedWallet: "",
  loadingHint: "",
});

export const getters = {
  loggedIn(state) {
    return state.loggedIn;
  },
  selectedWallet(state) {
    return state.selectedWallet;
  },
  loadingHint(state) {
    return state.loadingHint;
  },
  loader(state) {
    return state.loggedIn === false && state.selectedWallet !== "";
  },
};

export const mutations = {
  setLoggedIn(state, loggedInState) {
    state.loggedIn = loggedInState;
  },
  setSelectedWallet(state, name) {
    state.selectedWallet = name;
  },
  setLoadingHint(state, text) {
    state.loadingHint = text;
  },
};

export const actions = {};
