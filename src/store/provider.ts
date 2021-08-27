import onboardConfig from "@/configs/onboard";
import { APP_ZKSYNC_BLOCK_EXPLORER, ETHER_NETWORK_ID } from "@/plugins/build";
import { walletData } from "@/plugins/walletData";

import Onboard from "bnc-onboard";
import { API, Subscriptions, UserState, Wallet } from "bnc-onboard/dist/src/interfaces";

import { actionTree, getterTree, mutationTree } from "typed-vuex";
import { Address } from "zksync/build/types";

function getNameFromAddress(userAddress: Address): string {
  const walletName: string = window.localStorage.getItem(userAddress) || "";
  if (walletName.trim().length > 1 && walletName !== userAddress) {
    return walletName;
  }
  return userAddress.substr(0, 5) + "..." + userAddress.substr(userAddress.length - 5, userAddress.length - 1);
}

export declare type tProviderState = "ready" | "selectWallet" | "checkWallet" | "connecting" | "authorized";

export const state = () => ({
  onboard: Onboard({
    ...onboardConfig,
    subscriptions: <Subscriptions>{
      address: (address: Address) => {
        const windowProvider = process.client ? window.$nuxt!.$accessor!.provider : undefined;
        if (windowProvider!.loggedIn) {
          if ((address !== undefined && windowProvider!.address !== address) || (windowProvider!.address !== undefined && address === undefined)) {
            window.$nuxt!.$toast.global?.zkException({
              message: "Account switching spotted",
            });
            window.$nuxt!.$accessor.wallet.logout(false);
            window.$nuxt!.$router.push("/");
          }
        }
      },
      /**
       * Core method effecting the loggedIn status
       * @param {Wallet} wallet
       */
      wallet: (wallet: Wallet) => {
        const windowProvider = window.$nuxt!.$accessor!.provider;
        if (wallet.provider) {
          wallet.provider;
          if (wallet.name) {
            windowProvider!.storeSelectedWallet(wallet.name);
          }
        } else {
          windowProvider!.storeSelectedWallet("");
        }
      },
      network: (networkId: number) => {
        const windowProvider = process.client ? window.$nuxt!.$accessor!.provider : undefined;
        if (windowProvider!.loggedIn) {
          if (networkId !== undefined && networkId !== ETHER_NETWORK_ID) {
            window.$nuxt!.$toast.global?.zkException({
              message: "ETH Network change spotted",
            });
            if (!walletData.get().syncWallet) {
              window.$nuxt!.$accessor.wallet.logout(false);
              window.$nuxt.$router.push("/");
            } else {
              windowProvider!.walletCheck();
            }
          }
        }
      },
    },
  }) as API,
  accountName: <string>"",
  authStep: <tProviderState>"ready",
  selectedWallet: <string>"",
  loadingHint: <string>"",
});

export type ProviderModuleState = ReturnType<typeof state>;

export const mutations = mutationTree(state, {
  setAuthStage(state: ProviderModuleState, currentStep: tProviderState) {
    state.authStep = currentStep;
  },
  storeSelectedWallet(state: ProviderModuleState, selectedWallet: string) {
    localStorage.setItem("onboardSelectedWallet", selectedWallet as string);
    if (selectedWallet === undefined) {
      localStorage.removeItem("onboardSelectedWallet");
    }
    state.selectedWallet = selectedWallet;
  },
  setLoadingHint(state: ProviderModuleState, text: string) {
    state.loadingHint = text;
  },
  setName(state: ProviderModuleState, name: string) {
    state.accountName = name;
  },
});

export const getters = getterTree(state, {
  loggedIn: (state: ProviderModuleState) => state.authStep === "authorized" && !!state.onboard.getState().wallet!.provider && !!state.onboard.getState().address,
  getSelectedWallet: (state: ProviderModuleState) => state.selectedWallet,
  name: (state: ProviderModuleState): string | undefined => state.accountName,
  loader: (state: ProviderModuleState) => state.authStep === "connecting" || state.authStep === "checkWallet",
  address: (state: ProviderModuleState) => (state.onboard!.getState().address.length ? (state.onboard!.getState().address as Address) : undefined),
  loadingHint: (state: ProviderModuleState): string => state.loadingHint,
  zkScanUrl: (state: ProviderModuleState): string | undefined =>
    state.onboard.getState().address ? `${APP_ZKSYNC_BLOCK_EXPLORER}/accounts/${state.onboard.getState().address}` : undefined,
});

export const actions = actionTree(
  { state, getters, mutations },
  {
    authState({ state }): UserState {
      const accountState = state.onboard.getState();
      this.app.$accessor.provider.saveName(undefined);
      return accountState;
    },

    saveName({ state, commit }, name?: string): void {
      const currentAddress = state.onboard.getState().address;
      if (currentAddress) {
        if (!name) {
          if (!state.accountName) {
            name = window.localStorage.getItem(currentAddress) as string;
          }
          name = getNameFromAddress(currentAddress);
          window.localStorage.removeItem(currentAddress);
        }
        window.localStorage.setItem(currentAddress, name);
        commit("setName", name);
      }
    },

    async walletSelect({ state, commit }): Promise<boolean> {
      const result: boolean = await state.onboard.walletSelect();
      if (result) {
        commit("setAuthStage", "selectWallet");
      }
      return result;
    },

    async walletCheck({ state, commit, dispatch }): Promise<boolean> {
      commit("setAuthStage", "connecting");
      commit("setLoadingHint", "Follow the instructions in your Ethereum wallet");
      const checkStatus: boolean = await state.onboard.walletCheck();
      commit("setAuthStage", (checkStatus ? "connecting" : "selectWallet") as tProviderState);
      if (!checkStatus) {
        dispatch("reset");
      }
      return checkStatus;
    },

    async accountSelect({ state, commit }): Promise<boolean> {
      const result = await state.onboard.accountSelect();
      if (result) {
        commit("setAuthStage", "connecting");
      }
      return result;
    },

    reset({ state, commit }) {
      state.onboard.walletReset();
      commit("setAuthStage", "ready");
    },

    processWrongNetwork({ commit }) {
      commit("setAuthStage", "connecting");
    },

    async login({ state, dispatch, commit, getters }, forceReset = false): Promise<UserState> {
      if (forceReset) {
        alert("forced");
        dispatch("reset");
      }
      if (getters.loggedIn) {
        return dispatch("authState");
      }

      if (!["checkWallet", "accountSelect", "authorized", "connecting"].includes(state.authStep as string)) {
        dispatch("authState");
        const selectResult: boolean = await dispatch("walletSelect");
        if (!selectResult) {
          dispatch("reset");
          return dispatch("authState");
        }
      }
      const checkResult: boolean = await dispatch("walletCheck");
      if (!checkResult) {
        dispatch("reset");
        return dispatch("authState");
      }
      const authState: UserState = await dispatch("authState");
      if (authState.wallet!.type === "hardware") {
        const accountSelection: boolean = await dispatch("accountSelect");
        dispatch("authState");
        if (!accountSelection) {
          dispatch("reset");
          return dispatch("authState");
        }
      }
      return await dispatch("authState");
    },
  },
);
