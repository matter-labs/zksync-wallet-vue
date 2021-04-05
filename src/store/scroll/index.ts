import { getterTree, mutationTree } from "typed-vuex";

export const state = () => ({
  lastScroll: false as false | Number,
  lastPath: "" as String,
});

export type ScrollModuleState = ReturnType<typeof state>;

export const mutations = mutationTree(state, {
  setLastScroll(state, lastScroll: Number) {
    if (!lastScroll) {
      state.lastScroll = false;
    } else {
      state.lastScroll = lastScroll;
    }
  },
  setLastPath(state, lastPath: String) {
    state.lastPath = lastPath;
  },
});

export const getters = getterTree(state, {
  getLastScroll(state): false | Number {
    return state.lastScroll;
  },
  getLastPath(state): String {
    return state.lastPath;
  },
});
