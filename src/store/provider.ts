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
            alert("logging out triggered by address");
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
        if (windowProvider!.authStep === "authorized") {
          if (networkId !== undefined && networkId !== ETHER_NETWORK_ID) {
            window.$nuxt!.$toast.global?.zkException({
              message: "ETH Network change spotted",
            });
            if (!walletData.get().syncWallet) {
              alert("logging out triggered by network");
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
  loggedIn: (state: ProviderModuleState) => {
    const authState = state.onboard.getState();
    return authState.address !== undefined && authState.wallet.provider !== undefined;
  },
  selectedWallet: (state: ProviderModuleState) => state.selectedWallet,
  name: (state: ProviderModuleState): string | undefined => state.accountName,
  loader: (state: ProviderModuleState) => state.authStep === "connecting",
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
      const storedWallet = state.onboard.getState();
      console.warn(storedWallet);
      /* const storedSelectedWallet = state.selectedWallet as string | undefined;
       const result = await ((await dispatch("getOnboard")) as API).walletSelect(storedSelectedWallet); */
      const result = await state.onboard.walletSelect();
      if (result) {
        commit("setAuthStage", "selectWallet");
      }
      return result;
    },

    async walletCheck({ state, commit, dispatch }): Promise<boolean> {
      commit("setAuthStage", "connecting");
      commit("setLoadingHint", "Follow the instructions in your Ethereum wallet");
      try {
        const checkStatus: boolean = await state.onboard.walletCheck();
        if (checkStatus) {
          commit("setAuthStage", "authorized");
        } else {
          dispatch("reset");
        }
        return checkStatus;
      } catch (e) {
        alert("wallet check error!");
        console.error(e);
        return false;
      }
    },

    async accountSelect({ state, commit }): Promise<boolean> {
      const result = await state.onboard.accountSelect();
      if (result) {
        commit("setAuthStage", "connecting");
      }
      return result;
    },

    reset({ state, commit }) {
      console.log("reset called");
      state.onboard.walletReset();
      commit("setAuthStage", "ready");
    },

    processWrongNetwork({ commit }) {
      commit("setAuthStage", "connecting");
    },

    async login({ state, dispatch, commit }, forceReset = false): Promise<UserState> {
      if (state.authStep === "authorized") {
        console.log("authorized");
        return dispatch("authState");
      }
      if (forceReset) {
        alert("forced");
        dispatch("reset");
      }
      console.log("before wallet select");
      if (!["checkWallet", "accountSelect", "authorized", "connecting"].includes(state.authStep as string)) {
        console.log("wallet select required");
        dispatch("authState");
        const selectResult: boolean = await dispatch("walletSelect");
        if (!selectResult) {
          dispatch("reset");
          return dispatch("authState");
        }
      }
      console.log("before check wallet");
      //      if (state.authStep !== "checkWallet") {
      const checkResult: boolean = await dispatch("walletCheck");
      dispatch("authState");
      if (!checkResult) {
        dispatch("reset");
        return dispatch("authState");
      }
      //      }
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
      return await dispatch("authState");
    },
  },
);
