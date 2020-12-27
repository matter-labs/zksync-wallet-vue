export const state = () => ({});

export const mutations = {
  showLoader(state) {
    state.screenLoader = true;
  },
  hideLoader(state) {
    state.screenLoader = false;
  },
};

export const getters = {
  getScreenLoader(state) {
    return state.screenLoader;
  },
};

export const actions = {
  /* async nuxtClientInit(state, ctx) {
    console.log(this);
  } */
};
