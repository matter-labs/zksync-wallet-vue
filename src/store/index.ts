import * as account from "@/store/account";
import * as contacts from "@/store/contacts";
import * as toaster from "@/store/toaster";
import * as tokens from "@/store/tokens";
import * as transaction from "@/store/transaction";
import * as wallet from "@/store/wallet";
import { actionTree, getAccessorType, getterTree, mutationTree } from "typed-vuex";

export const state = () => ({
  accountModalOpened: false,
  /**
   * Used to handle modals and simplify the code
   */
  currentModal: <boolean | string>false,
});

export type RootState = ReturnType<typeof state>;

export const getters = getterTree(state, {
  getAccountModalState: (state) => state.accountModalOpened,
  currentModal: (state) => state.currentModal,
});

export const mutations = mutationTree(state, {
  setAccountModalState(state, modalState: boolean) {
    state.accountModalOpened = modalState;
  },
  setCurrentModal(state, modalName: string | false) {
    state.currentModal = modalName;
  },
});

export const actions = actionTree(
  { state, getters, mutations },
  {
    //    async resetEmail(): Promise<void> {
    //      this.app.$accessor.anotherModule.doSomething();
    //    },
    openModal({ commit }, modalName) {
      commit("setCurrentModal", modalName);
    },
    closeActiveModal({ commit }) {
      commit("setCurrentModal", false);
    },
    //    async resetEmail({ commit, dispatch, getters, state }) {
    //      // Typed
    //      commit("initialiseStore");
    //      let a = getters.email;
    //      let b = state._email;
    //
    //      // Not typed
    //      dispatch("resetEmail");
    //
    //      // Typed
    //      this.app.$accessor.resetEmail();
    //    },
    //    async nuxtServerInit(_vuexContext, nuxtContext: Context) {
    //      console.log(nuxtContext.req);
    //    },
  },
);

export const accessorType = getAccessorType({
  state,
  getters,
  mutations,
  actions,
  modules: {
    account,
    contacts,
    toaster,
    tokens,
    transaction,
    wallet,
  },
});
