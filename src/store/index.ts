import { actionTree, getAccessorType, getterTree, mutationTree } from "typed-vuex";
import { Route } from "vue-router/types";
import { ZKIRootState } from "@/types/lib";

export const state = (): ZKIRootState => ({
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
  setAccountModalState(state: RootState, modalState: boolean): void {
    state.accountModalOpened = modalState;
  },
  setCurrentModal(state: RootState, modalName: string): void {
    state.currentModal = modalName;
  },
  setPreviousRoute(state: RootState, route: Route): void {
    state.previousRoute = route;
  },
  removeCurrentModal(state: RootState): void {
    state.currentModal = undefined;
  },
});

export const actions = actionTree(
  { state, getters, mutations },
  {
    openModal({ commit }, modalName: string): void {
      commit("setCurrentModal", modalName);
    },
    closeActiveModal({ commit }): void {
      commit("removeCurrentModal");
    },
  },
);

export const accessorType = getAccessorType({
  state,
  getters,
  mutations,
  actions,
  modules: {},
});
