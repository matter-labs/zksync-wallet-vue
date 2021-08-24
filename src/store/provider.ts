import onboardConfig from "@/configs/onboard";
import { APP_ZKSYNC_BLOCK_EXPLORER, ETHER_NETWORK_ID } from "@/plugins/build";
import { walletData } from "@/plugins/walletData";

import Onboard from "bnc-onboard";
import { API, Subscriptions, UserState, Wallet } from "bnc-onboard/dist/src/interfaces";
import account from "bnc-sdk/dist/types/src/account";

import { actionTree, getterTree, mutationTree } from "typed-vuex";
import { Address } from "zksync/build/types";

function getNameFromAddress(userAddress: Address): string {
  const walletName: string = window.localStorage.getItem(userAddress) || "";
  if (walletName.trim().length > 1 && walletName !== userAddress) {
    return walletName;
  }
  return userAddress.substr(0, 5) + "..." + userAddress.substr(userAddress.length - 5, userAddress.length - 1);
}

/**
 * Testing-only closure
 * @param {string} message
 */
const debugReport = (message: string): void => {
  window.$nuxt.$toast.global?.zkException({ message });
};

export declare type tProviderState = "ready" | "selectWallet" | "checkWallet" | "connecting" | "authorized";

export const state = () => ({
  onboard: Onboard({
    ...onboardConfig,
    subscriptions: <Subscriptions>{
      address: (address: string | undefined): void => {
        const provider = window.$nuxt!.$accessor.provider;
        debugReport(`subscription[address]: received address: (${address}), step: (${provider.authStep}) UserState: (${JSON.stringify(provider.authState())})`);
        if (provider.authStep === "authorized") {
          debugReport(`subscription[address]: condition matched. Current wallet address: ${provider.address} `);
          if ((address !== undefined && provider.address !== address) || (provider.address === undefined && address === undefined)) {
            window.$nuxt.$toast.global?.zkException({
              message: "Account switching spotted",
            });
            debugReport("subscription[address]: logging out...");
            window.$nuxt.$accessor.wallet.logout(false);
            debugReport(`subscription[address]: logged out. Current wallet address: ${provider.address}. Redirecting....`);
            window.$nuxt.$router.push("/");
          }
        }
      },
      wallet: (wallet: Wallet | undefined): void => {
        const provider = window.$nuxt!.$accessor.provider;
        debugReport(`subscription[wallet]: received wallet: (${JSON.stringify(wallet)}), step: (${provider.authStep}) UserState: (${JSON.stringify(provider.authState())})`);
      },
      network: (networkId: number | undefined): void => {
        const provider = window.$nuxt!.$accessor.provider;
        debugReport(`subscription[network]: received networkId: (${networkId}), step: (${provider.authStep}) UserState: (${JSON.stringify(provider.authState())})`);
        if (window.$nuxt!.$accessor.provider.authStep === "authorized") {
          if (networkId !== undefined && networkId !== ETHER_NETWORK_ID) {
            debugReport(`subscription[address]: condition matched. Expected NET id: ${ETHER_NETWORK_ID} `);
            window.$nuxt!.$toast.global?.zkException({
              message: "ETH Network change spotted",
            });
            if (!walletData.get().syncWallet) {
              debugReport(`subscription[network]: walletData syncWallet undefined, step: (${provider.authStep}) UserState: (${JSON.stringify(provider.authState())}). Loggin out.`);
              window.$nuxt!.$accessor.wallet.logout(false);
              debugReport(`subscription[address]: logged out. step: (${provider.authStep}) UserState: (${JSON.stringify(provider.authState())})`);
              window.$nuxt.$router.push("/");
              return;
            }
            debugReport(`subscription[address]: walletCheck called. step: (${provider.authStep}) UserState: (${JSON.stringify(provider.authState())})`);
            window.$nuxt.$accessor.provider.walletCheck();
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
    debugReport("set auth stage called w/t the result: " + currentStep);
    state.authStep = currentStep;
  },
  storeSelectedWallet(state: ProviderModuleState, selectedWallet: string | undefined) {
    localStorage.setItem("onboardSelectedWallet", selectedWallet as string);
    if (selectedWallet === undefined) {
      localStorage.removeItem("onboardSelectedWallet");
    }
    state.selectedWallet = selectedWallet;
    state.selectedWallet = selectedWallet;
  },
  setLoadingHint(state: ProviderModuleState, text: string) {
    state.loadingHint = text;
  },
  setName(state: ProviderModuleState, name?: string): void {
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
      state.accountName = getNameFromAddress(currentAddress);
    }
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
    authState({ state, commit }): UserState {
      const accountState = state.onboard.getState();
      commit("setName", undefined);
      console.log("current account state", accountState);
      return accountState;
    },

    async walletSelect({ state, commit }): Promise<boolean> {
      const storedWallet = state.onboard.getState();
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
      let checkStatus = false;
      try {
        checkStatus = await state.onboard.walletCheck();
      } catch (e) {
        console.error(e);
      }
      if (checkStatus) {
        commit("setAuthStage", "authorized");
      } else {
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
      console.log("reset called");
      state.onboard.walletReset();
      commit("setAuthStage", "ready");
    },

    processWrongNetwork({ commit }) {
      commit("setAuthStage", "connecting");
    },

    async login({ state, dispatch, commit }, forceReset = false): Promise<UserState> {
      debugReport(`login called: step (${state.authStep}), UserState: (${JSON.stringify(dispatch("authState"))})`);
      if (state.authStep === "authorized") {
        debugReport(`login ended, is already authorized, UserState: (${JSON.stringify(dispatch("authState"))})`);
        return dispatch("authState");
      }
      if (forceReset) {
        alert("forced");
        dispatch("reset");
      }
      console.log("before wallet select");
      if (!["checkWallet", "accountSelect", "authorized", "connecting"].includes(state.authStep as string)) {
        debugReport(`login, walletSelect should be called. UserState: (${JSON.stringify(dispatch("authState"))})`);
        dispatch("authState");
        const selectResult: boolean = await dispatch("walletSelect");
        debugReport(`login, after walletSelect: ${selectResult.toString()} should be called. UserState: (${JSON.stringify(dispatch("authState"))})`);
        if (!selectResult) {
          debugReport(`login ended after walletSelect, UserState: (${JSON.stringify(dispatch("authState"))})`);
          dispatch("reset");
          return dispatch("authState");
        }
      }
      debugReport(`login, before walletCheck should be called.: step (${state.authStep}), UserState: (${JSON.stringify(dispatch("authState"))})`);
      //      if (state.authStep !== "checkWallet") {
      const checkResult: boolean = await dispatch("walletCheck");
      dispatch("authState");
      debugReport(`login, walletCheck result: (${checkResult.toString()}) step (${state.authStep}), UserState: (${JSON.stringify(dispatch("authState"))})`);
      if (!checkResult) {
        debugReport(`login ended after walletCheck, UserState: (${JSON.stringify(dispatch("authState"))})`);
        dispatch("reset");
        return dispatch("authState");
      }
      //      }
      console.log("before auth state");
      const authState: UserState = await dispatch("authState");
      if (authState.wallet!.type === "hardware") {
        debugReport(`login, hardware wallet found. Calling accountSelect. step (${state.authStep}), UserState: (${JSON.stringify(dispatch("authState"))})`);
        console.log("special call for the hardware wallet");
        const accountSelection: boolean = await dispatch("accountSelect");
        debugReport(`login, accountSelect result: (${accountSelection.toString()}) reset step (${state.authStep}), UserState: (${JSON.stringify(dispatch("authState"))})`);
        dispatch("authState");
        if (!accountSelection) {
          dispatch("reset");
          return dispatch("authState");
        }
      }
      debugReport(`login ended successfully, step (${state.authStep}) UserState: (${JSON.stringify(dispatch("authState"))})`);
      return await dispatch("authState");
    },
  },
);
