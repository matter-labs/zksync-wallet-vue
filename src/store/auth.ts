import onboardConfig from "@/configs/onboard";
import web3Wallet from "@/plugins/web3";
import Onboard from "bnc-onboard";
import { API, Initialization, Subscriptions, UserState, Wallet as OnboardWallet } from "bnc-onboard/dist/src/interfaces";

import { actionTree, getterTree, mutationTree } from "typed-vuex";
import Web3 from "web3";
import { Address } from "zksync/build/types";

export declare type tAuthStage = "initial" | "loaded" | "selectWallet" | "checkWallet" | "accountSelect" | "connecting" | "authorized";

declare interface iAuthModuleState {
  onboard?: API;
  authStep?: tAuthStage;
  onboardConfig: Initialization;
  selectedWallet?: string;
  loadingHint: string;
}

export const state = () =>
  <iAuthModuleState>{
    onboard: undefined,
    authStep: "initial",
    onboardConfig,
    selectedWallet: localStorage.getItem("onboardSelectedWallet") || undefined,
    loadingHint: "",
  };

export type AuthModuleStore = ReturnType<typeof state>;

export const mutations = mutationTree(state, {
  setOnboard(state: AuthModuleStore, onboard: API): void {
    state.onboard = onboard;
  },
  setAuthStage(state: AuthModuleStore, currentStep: tAuthStage): void {
    console.log("auth step:", currentStep);
    state.authStep = currentStep;
  },
  storeSelectedWallet(state: AuthModuleStore, selectedWallet: string | undefined): void {
    localStorage.setItem("onboardSelectedWallet", selectedWallet as string);
    if (selectedWallet === undefined) {
      localStorage.removeItem("onboardSelectedWallet");
    }
    state.selectedWallet = selectedWallet;
    state.selectedWallet = selectedWallet;
  },
  setLoadingHint(state: AuthModuleStore, text: string): void {
    state.loadingHint = text;
  },
});

export const getters = getterTree(state, {
  loggedIn: (state: AuthModuleStore): boolean => state.authStep === "authorized",
  selectedWallet: (state: AuthModuleStore): string | undefined => state.selectedWallet,
  loader: (state: AuthModuleStore): boolean => state.authStep === "connecting",
  address: (state: AuthModuleStore): Address | undefined => (state.onboard!.getState().address.length ? (state.onboard!.getState().address as Address) : undefined),
  loadingHint: (state: AuthModuleStore): string => state.loadingHint,
});

export const actions = actionTree(
  { state, getters, mutations },
  {
    /**
     * Get onboard on-demand
     * @param {any} state
     * @param {any} commit
     * @return {Promise<API>}
     */
    async getOnboard({ state, commit }): Promise<API> {
      if (state.onboard === undefined) {
        const obOnboard: API = await Onboard({
          ...state.onboardConfig,
          subscriptions: <Subscriptions>{
            wallet: (wallet: OnboardWallet): void => {
              console.log("subscription 'wallet' called");
              if (!process.client || !wallet.provider) {
                commit("storeSelectedWallet", undefined);
                return;
              }
              wallet.provider.autoRefreshOnNetworkChange = false;
              web3Wallet.set(new Web3(wallet.provider));
              if (wallet.name) {
                commit("storeSelectedWallet", wallet.name);
              }
            },
          },
        });
        commit("setOnboard", obOnboard);
        commit("setAuthStage", "loaded");
      }
      return state.onboard as API;
    },

    /**
     * Get onboard on-demand
     * @param dispatch
     * @param commit
     * @return {Promise<UserState>}
     */
    async authState({ dispatch, commit }): Promise<UserState> {
      return ((await dispatch("getOnboard")) as API).getState();
    },

    async walletSelect({ dispatch, state, commit }): Promise<boolean> {
      /* const storedSelectedWallet = state.selectedWallet as string | undefined;
      const result = await ((await dispatch("getOnboard")) as API).walletSelect(storedSelectedWallet); */
      const result = await ((await dispatch("getOnboard")) as API).walletSelect();
      if (result) {
        commit("setAuthStage", "selectWallet");
      }
      return result;
    },

    async walletCheck({ dispatch, commit }): Promise<boolean> {
      const result = await ((await dispatch("getOnboard")) as API).walletCheck();
      if (result) {
        commit("setAuthStage", "checkWallet");
      }
      return result;
    },

    async accountSelect({ dispatch, commit }): Promise<boolean> {
      const result = await ((await dispatch("getOnboard")) as API).accountSelect();
      if (result) {
        commit("setAuthStage", "accountSelect");
      }
      return result;
    },

    async reset({ dispatch, commit }): Promise<void> {
      ((await dispatch("getOnboard")) as API).walletReset();
      commit("setAuthStage", "loaded");
    },

    async login({ state, dispatch, commit }, forceReset = false): Promise<void> {
      if (state.authStep === "authorized") {
        return;
      }
      if (forceReset) {
        alert("forced");
        await dispatch("reset");
      }

      if (!["checkWallet", "accountSelect", "authorized", "connecting"].includes(state.authStep as string)) {
        const selectResult: boolean = await dispatch("walletSelect");
        if (!selectResult) {
          return dispatch("reset");
        }
      }
      if (state.authStep !== "checkWallet") {
        const checkResult: boolean = await dispatch("walletCheck");
        if (!checkResult) {
          return dispatch("reset");
        }
      }
      const authState: UserState = await dispatch("authState");
      if (authState.wallet!.type === "hardware") {
        const accountSelection: boolean = await dispatch("accountSelect");
        if (!accountSelection) {
          return dispatch("reset");
        }
      }
    },
  },
);
