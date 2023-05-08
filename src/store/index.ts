import { actionTree, getAccessorType, getterTree, mutationTree } from "typed-vuex";
import { Route } from "vue-router/types";
import { Context } from "@nuxt/types";
import providerModule from "./provider";
import tokensModule from "./tokens";
import walletModule from "./wallet";
import feesModule from "./fees";
import balancesModule from "./balances";
import historyModule from "./history";
import accountModule from "./account";
import transactionModule from "./transaction";
import onboardModule from "./onboard";
import contactsModule from "./contacts";
import nftModule from "./nfts";
import unsModule from "./uns";
import modalModule from "./modal";
import { ModuleOptions } from "@/types/zksync";

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

// eslint-disable-next-line quotes
const options: ModuleOptions = JSON.parse(`<%= JSON.stringify(options) %>`);

export default ({ store }: Context) => {
  const modules = [
    ["provider", providerModule],
    ["tokens", tokensModule],
    ["wallet", walletModule],
    ["fees", feesModule],
    ["balances", balancesModule],
    ["history", historyModule],
    ["account", accountModule],
    ["transaction", transactionModule],
    ["onboard", onboardModule],
    ["contacts", contactsModule],
    ["nft", nftModule],
    ["uns", unsModule],
    ["modal", modalModule],
  ];
  for (const module of modules) {
    /* TODO: Figure out the issue with typing of module[1](options) */
    // @ts-ignore
    store.registerModule("zk-" + module[0], module[1](options), {
      preserveState: Boolean(store.state["zk-" + module[0]]),
    });
  }
};