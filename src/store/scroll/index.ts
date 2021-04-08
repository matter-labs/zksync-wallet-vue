import { getterTree, mutationTree } from "typed-vuex";

type VueRouterScroll = false | { x: number; y: number };

export const state = () => ({
  lastScroll: false as VueRouterScroll,
  lastPath: "" as String,
});

export type ScrollModuleState = ReturnType<typeof state>;

export const mutations = mutationTree(state, {
  setLastScroll(state, lastScroll: VueRouterScroll) {
    state.lastScroll = lastScroll || false;
  },
  setLastPath(state, lastPath: String) {
    state.lastPath = lastPath;
  },
});

export const getters = getterTree(state, {
  getLastScroll(state): number {
    return !state.lastScroll ? 0 : state.lastScroll.y;
  },
  getLastPath(state): String {
    return state.lastPath;
  },
});
