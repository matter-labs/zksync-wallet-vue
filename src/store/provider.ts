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
      address: async (address: Address | undefined): Promise<void> => {
        console.log("subscription: address", address);
        const windowProvider = process.client ? window.$nuxt!.$accessor!.provider : undefined;
        if (windowProvider!.authStep === "authorized") {
          if ((address !== undefined && windowProvider!.address !== address) || (windowProvider!.address === undefined && address === undefined)) {
            window.$nuxt!.$toast.global?.zkException({
              message: "Account switching spotted",
            });
            window.$nuxt!.$accessor.wallet.logout(false);
            await window.$nuxt!.$router.push("/");
          }
        }
      },
      wallet: (wallet: Wallet | undefined) => {
        console.log("subscription: wallet", wallet);
      },
      network: async (networkId: number | undefined) => {
        const windowProvider = process.client ? window.$nuxt!.$accessor!.provider : undefined;
        console.log("subscription: network", networkId);
        if (windowProvider!.loggedIn) {
          if (networkId !== undefined && networkId !== ETHER_NETWORK_ID) {
            window.$nuxt!.$toast.global?.zkException({
              message: "ETH Network change spotted",
            });
            if (!walletData.get().syncWallet) {
              window.$nuxt!.$accessor.wallet.logout(false);
              await window.$nuxt.$router.push("/");
            } else {
              await windowProvider!.walletCheck();
            }
          }
        }
      },
    },
  }) as API,
  accountName: <string>"",
  authStep: <tProviderState>"ready",
  selectedWallet: localStorage.getItem("onboardSelectedWallet") || undefined,
  loadingHint: "",
});

export type ProviderModuleState = ReturnType<typeof state>;

export const mutations = mutationTree(state, {
  setAuthStage(state: ProviderModuleState, currentStep: tProviderState) {
    state.authStep = currentStep;
  },
  storeSelectedWallet(state: ProviderModuleState, selectedWallet: string | undefined) {
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
  selectedWallet: (state: ProviderModuleState) => state.selectedWallet,
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
      console.warn("current account state", accountState);
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
      const storedSelectedWallet = state.selectedWallet as string | undefined;
      const result = await state.onboard.walletSelect(storedSelectedWallet);
      commit("setAuthStage", result ? "selectWallet" : "ready");
      return result;
    },

    async walletCheck({ state, commit, dispatch }): Promise<boolean> {
      commit("setAuthStage", "checkWallet");
      commit("setLoadingHint", "Follow the instructions in your Ethereum wallet");
      const checkStatus: boolean = await state.onboard.walletCheck();
      commit("setAuthStage", (checkStatus ? "loading" : "selectWallet") as tProviderState);
      if (!checkStatus) {
        dispatch("reset");
      }
      return checkStatus;
    },

    async accountSelect({ state }): Promise<boolean> {
      return await state.onboard.accountSelect();
    },

    reset({ state, commit }) {
      console.log("reset called");
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
        console.log("authorized");
        return dispatch("authState");
      }

      console.log("before wallet select");
      if (state.authStep === "ready") {
        console.log("wallet select required");
        dispatch("authState");
        const selectResult: boolean = await dispatch("walletSelect");
        if (!selectResult) {
          dispatch("reset");
          return dispatch("authState");
        }
      }
      console.log("before check wallet");
      const checkResult: boolean = await dispatch("walletCheck");
      if (!checkResult) {
        dispatch("reset");
        return dispatch("authState");
      }
      console.log("before auth state");
      const authState: UserState = await dispatch("authState");
      if (authState.wallet!.type === "hardware") {
        console.log("special call for the hardware wallet");
        const accountSelection: boolean = await dispatch("accountSelect");
        dispatch("authState");
        if (!accountSelection) {
          dispatch("reset");
          return dispatch("authState");
        }
      }
      return dispatch("authState");
    },
  },
);
