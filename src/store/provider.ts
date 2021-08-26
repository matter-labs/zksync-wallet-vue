import onboardConfig from "@/configs/onboard";
import { APP_ZKSYNC_BLOCK_EXPLORER, ETHER_NETWORK_ID } from "@/plugins/build";
import { walletData } from "@/plugins/walletData";

import Onboard from "bnc-onboard";
import { API, Subscriptions, UserState, Wallet as OnboardWallet } from "bnc-onboard/dist/src/interfaces";

import { actionTree, getterTree, mutationTree } from "typed-vuex";
import { Address } from "zksync/build/types";
import { ZKTypeProviderState } from "~/types/lib.d";

export const state = () => ({
  onboard: Onboard({
    ...onboardConfig,
    subscriptions: <Subscriptions>{
      address: async (address: Address | undefined): Promise<void> => {
        console.log("subscription: address", address);
        const windowProvider = process.client ? window.$nuxt!.$accessor!.provider : undefined;
        if (windowProvider!.loggedIn) {
          if ((address !== undefined && windowProvider!.address !== address) || (windowProvider!.address === undefined && address === undefined)) {
            window.$nuxt!.$toast.global?.zkException({
              message: "Account switching spotted",
            });
            window.$nuxt!.$accessor.wallet.logout(false);
            await window.$nuxt!.$router.push("/");
          }
        }
      },
      /**
       * Core method effecting the loggedIn status
       * @param {Wallet} wallet
       */
      wallet: (wallet: OnboardWallet) => {
        console.log("subscription: wallet", wallet);
        //        const windowProvider = process.client ? window.$nuxt!.$accessor!.provider : undefined;
        //        if (wallet.provider) {
        //          windowProvider?.setOnboardWallet(wallet);
        //          const ethersProvider: ethers.providers.JsonRpcProvider = new ethers.providers.Web3Provider(wallet.provider);
        //          windowProvider?.setProvider(ethersProvider);
        //        } else {
        //          windowProvider?.setOnboardWallet(undefined);
        //          windowProvider?.setProvider(undefined);
        //        }
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
  authStep: <ZKTypeProviderState>"ready",
  selectedWallet: localStorage.getItem("onboardSelectedWallet") || undefined,
  loadingHint: "",
});

export type ProviderModuleState = ReturnType<typeof state>;

export const mutations = mutationTree(state, {
  setAuthStage(state: ProviderModuleState, currentStep: ZKTypeProviderState) {
    state.authStep = currentStep;
  },
  setLoadingHint(state: ProviderModuleState, text: string) {
    state.loadingHint = text;
  },
  setName(state: ProviderModuleState, newName: string) {
    window.localStorage.setItem(state.onboard.getState().address, newName);
    state.accountName = newName;
  },
});

export const getters = getterTree(state, {
  loggedIn: (state: ProviderModuleState) =>
    state.authStep === "authorized" && state.onboard.getState().wallet.instance !== null && state.onboard.getState().wallet.provider && state.onboard.getState().address,
  selectedWallet: (state: ProviderModuleState) => state.selectedWallet,
  name: (state: ProviderModuleState): string | undefined => state.accountName,
  loader: (state: ProviderModuleState) => {
    return state.authStep !== "ready" && state.authStep !== "authorized";
  },
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
    saveName({ state, getters, commit }, name = ""): void {
      const currentAddress = getters.address as Address;
      if (!currentAddress) {
        return;
      }
      let nameToSet: string = name.trim();
      if (!nameToSet) {
        nameToSet = (window.localStorage.getItem(currentAddress) as string).trim();
      }

      if (!nameToSet) {
        nameToSet = currentAddress.substr(0, 5) + "..." + currentAddress.substr(currentAddress.length - 5, currentAddress.length - 1);
      }

      commit("setName", nameToSet);
    },

    async walletSelect({ state, commit }): Promise<boolean> {
      //      const storedSelectedWallet = state.selectedWallet as string;
      //      console.log(storedSelectedWallet);
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

    async login({ state, dispatch, commit, getters }, forceReset = false): Promise<UserState> {
      if (getters.loggedIn) {
        console.log("authorized");
        return dispatch("authState");
      }
      if (forceReset) {
        alert("forced");
        dispatch("reset");
      }
      const isConnected = await dispatch("connect");
      console.log("before auth state");
      const authState: UserState = await dispatch("authState");
      if (isConnected && authState.wallet!.type === "hardware") {
        console.log("special call for the hardware wallet");
        const accountSelection: boolean = await dispatch("accountSelect");
        dispatch("authState");
        if (!accountSelection) {
          dispatch("reset");
        }
      }
      return authState;
    },

    async connect({ state, dispatch }) {
      console.log("connect called", state);
      if (!state.onboard.getState().wallet.provider || !state.onboard.getState().address || !state.onboard.getState().wallet.instance === null) {
        const walletSelected: boolean = await dispatch("walletSelect");
        if (!walletSelected) {
          return false;
        }
      }

      const walletCheckState = await dispatch("walletCheck");
      return walletCheckState as boolean;
    },
  },
);
