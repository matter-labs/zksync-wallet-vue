import { actionTree, getAccessorType, getterTree, mutationTree } from "typed-vuex";
import { Route } from "vue-router/types";

let resolveModal: ((result: boolean) => void) | undefined;

export const state = (): {
  accountModalOpened: boolean;
  currentModal?: string;
  previousRoute?: Route;
} => ({
  accountModalOpened: false,
  currentModal: undefined,
  previousRoute: undefined,
});

export type RootState = ReturnType<typeof state>;

export const getters = getterTree(state, {
  getAccountModalState: (state: RootState) => state.accountModalOpened,
  getPreviousRoute: (state: RootState) => state.previousRoute,
  currentModal: (state: RootState) => state.currentModal,
});

export const mutations = mutationTree(state, {
  setAccountModalState(state: RootState, modalState: boolean) {
    state.accountModalOpened = modalState;
  },
  setCurrentModal(state: RootState, modalName: string) {
    state.currentModal = modalName;
  },
  setPreviousRoute(state: RootState, route: Route) {
    state.previousRoute = route;
  },
  removeCurrentModal(state: RootState) {
    state.currentModal = undefined;
  },
});

export const actions = actionTree(
  { state, getters, mutations },
  {
    openModal({ commit }, modalName: string) {
      commit("setCurrentModal", modalName);
    },
    closeActiveModal({ commit }, result?: boolean) {
      commit("removeCurrentModal");
      if (resolveModal) {
        resolveModal(!!result);
      }
    },
    async openDialog({ dispatch }, modalName: string) {
      dispatch("openModal", modalName);
      return await new Promise((resolve) => {
        resolveModal = resolve;
      });
    },
  }
);

export const accessorType = getAccessorType({
  state,
  getters,
  mutations,
  actions,
  modules: {},
});
