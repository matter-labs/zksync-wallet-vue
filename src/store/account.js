export const state = () => ({
  loggedIn: false,
  selectedWallet: "",
  loadingHint: "",
  address: "",
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
  address(state) {
    return state.address;
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
  setAddress(state, address) {
    state.address = address;
  },
};

export const actions = {};
