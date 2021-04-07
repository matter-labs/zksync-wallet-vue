import { getterTree, mutationTree } from "typed-vuex";

type VueRouterScroll = false | { x: number; y: number };

export const state = () => ({
  lastScroll: false as VueRouterScroll,
  lastPath: "" as String,
});

export type ScrollModuleState = ReturnType<typeof state>;

export const mutations = mutationTree(state, {
  setLastScroll(state, lastScroll: VueRouterScroll) {
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
  getLastScroll(state): number {
    if (!state.lastScroll) {
      return 0;
    }
    return state.lastScroll.y;
  },
  getLastPath(state): String {
    return state.lastPath;
  },
});
