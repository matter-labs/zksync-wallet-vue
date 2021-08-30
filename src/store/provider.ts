import onboardConfig from "@/configs/onboard";
import { APP_ZKSYNC_BLOCK_EXPLORER, ETHER_NETWORK_ID } from "@/plugins/build";
import { walletData } from "@/plugins/walletData";

import Onboard from "bnc-onboard";
import { API, Subscriptions, UserState, Wallet, Ens } from "bnc-onboard/dist/src/interfaces";

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
      ens: (ens: Ens) => {
        console.log("subscription watcher (ens): ", ens);
      },
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
        const windowProvider = process.client ? window.$nuxt!.$accessor!.provider : undefined;
        if (wallet.provider) {
          wallet.provider!.autoRefreshOnNetworkChange = false;
          if (wallet.name) {
            windowProvider!.storeSelectedWallet(wallet.name);
          }
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
  selectedWallet: <string | undefined>window.localStorage.getItem("onboardSelectedWallet") === null ? undefined : (window.localStorage.getItem("onboardSelectedWallet") as string),
  loadingHint: <string>"",
});

export type ProviderModuleState = ReturnType<typeof state>;

export const mutations = mutationTree(state, {
  setAuthStage(state: ProviderModuleState, currentStep: tProviderState) {
    state.authStep = currentStep;
  },
  storeSelectedWallet(state: ProviderModuleState, selectedWallet: string | undefined = undefined) {
    if (selectedWallet) {
      localStorage.setItem("onboardSelectedWallet", selectedWallet);
    }
    state.selectedWallet = selectedWallet;
  },
  setLoadingHint(state: ProviderModuleState, text: string) {
    state.loadingHint = text;
  },
  setName(state: ProviderModuleState, name?: string) {
    if (name !== undefined) {
      state.accountName = name;
    }
  },
});

export const getters = getterTree(state, {
  loggedIn: (state: ProviderModuleState) => state.authStep === "authorized" && !!state.onboard.getState().wallet!.provider && !!state.onboard.getState().address,
  getSelectedWallet: (state: ProviderModuleState): string | undefined => (state.authStep ? state.selectedWallet : undefined),
  name: (state: ProviderModuleState): string => {
    if (state.authStep !== "authorized") {
      return "";
    }
    if (!state.accountName) {
      const currentAddress = state.onboard.getState()?.address;
      return currentAddress !== undefined ? getNameFromAddress(currentAddress) : "";
    }
    return state.accountName;
  },
  loader: (state: ProviderModuleState) => state.authStep === "connecting" || state.authStep === "checkWallet",
  address: (state: ProviderModuleState): Address | undefined => {
    if (state.authStep !== "authorized") {
      return undefined;
    }
    const address = state.onboard.getState().address;
    if (!address) {
      return undefined;
    }
    return address as Address;
  },
  loadingHint: (state: ProviderModuleState): string => state.loadingHint,
  zkScanUrl: (state: ProviderModuleState): string | undefined =>
    state.onboard.getState().address ? `${APP_ZKSYNC_BLOCK_EXPLORER}/accounts/${state.onboard.getState().address}` : undefined,
});

export const actions = actionTree(
  { state, getters, mutations },
  {
    authState: ({ state }): UserState => state.onboard.getState(),

    saveName({ state, commit, getters }, name?: string) {
      const currentAddress: Address | undefined = getters.address;
      if (currentAddress !== undefined) {
        if (!name || !name.trim()) {
          name = window.localStorage.getItem(currentAddress)!.trim();
        }
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
      commit("storeSelectedWallet", undefined);
      commit("setAuthStage", "ready");
    },

    processWrongNetwork({ commit }) {
      commit("setAuthStage", "connecting");
    },

    async login({ state, dispatch, getters }): Promise<UserState> {
      if (getters.loggedIn) {
        return dispatch("authState");
      }

      if (!["checkWallet", "accountSelect", "authorized", "connecting"].includes(state.authStep)) {
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
