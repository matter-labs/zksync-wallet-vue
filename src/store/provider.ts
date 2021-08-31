import onboardConfig from "@/configs/onboard";
import { APP_ZKSYNC_BLOCK_EXPLORER, ETHER_NETWORK_ID, rpc } from "@/plugins/build";
import { walletData } from "@/plugins/walletData";
import WalletConnectProvider from "@walletconnect/web3-provider";

import Onboard from "bnc-onboard";
import { API, UserState, Wallet } from "bnc-onboard/dist/src/interfaces";

import { actionTree, getterTree, mutationTree } from "typed-vuex";
import { Address } from "zksync/build/types";

export declare type tProviderState = "ready" | "isSelecting" | "walletSelected" | "isChecking" | "walletChecked" | "isSelectingAccount" | "accountSelected" | "authorized";

const onboard: API = Onboard({
  ...onboardConfig,
  subscriptions: {
    address: (address: string) => {
      console.log("subscription watcher (wallet): ", address);
      const windowAccessor = window.$nuxt.$accessor;
      if (windowAccessor.provider.loggedIn) {
        if ((address !== undefined && windowAccessor.provider.address !== (address as Address)) || (windowAccessor.provider.address !== undefined && address === undefined)) {
          window.$nuxt.$toast.global?.zkException({
            message: "Account switching spotted",
          });
          windowAccessor.wallet.logout(false);
        }
      }
    },
    wallet: (wallet: Wallet) => {
      const windowAccessor = window.$nuxt.$accessor;
      console.log("subscription watcher (wallet): ", wallet.provider, wallet.instance);
      console.log(wallet.provider);
      if (wallet && wallet.provider) {
        console.log(wallet.provider);
        wallet.provider.autoRefreshOnNetworkChange = false;

        if (wallet.name?.toLowerCase() === "walletconnect") {
          const providerWalletConnect: WalletConnectProvider = wallet.provider;
          providerWalletConnect.polling = false;
          providerWalletConnect.chainId = ETHER_NETWORK_ID;
          console.log("subscription watcher executing...");
          providerWalletConnect.updateRpcUrl(ETHER_NETWORK_ID, rpc[ETHER_NETWORK_ID]);
          windowAccessor.provider.storeSelectedWallet(wallet.name);
        }
      }
    },
    network: (networkId: number): void => {
      console.log("subscription watcher (network): ", networkId);
      const windowAccessor = window.$nuxt.$accessor;
      if (windowAccessor.provider.loggedIn) {
        if (networkId !== undefined && networkId !== ETHER_NETWORK_ID) {
          window.$nuxt!.$toast.global?.zkException({
            message: "ETH Network change spotted",
          });
          console.log(windowAccessor.provider);
          if (walletData.get().syncWallet && windowAccessor.provider.authStep === "authorized") {
            windowAccessor.provider
              .walletCheck()
              .then((checkState: boolean) => {
                if (checkState) {
                  windowAccessor.provider.setAuthStage("authorized");
                  window.$nuxt.$router.back();
                } else {
                  windowAccessor.wallet.logout(false);
                }
              })
              .catch((reason) => {
                console.log(reason);
                windowAccessor.wallet.logout(false);
              });
          }
        }
      }
    },
  },
});

export const state = () => ({
  onboard: <API>onboard,
  accountName: <string>"",
  authStep: <tProviderState>"ready",
  selectedWallet: <string | undefined>window.localStorage.getItem("onboardSelectedWallet") === null ? undefined : (window.localStorage.getItem("onboardSelectedWallet") as string),
  loadingHint: <string>"",
  isProviderStored: <boolean>false,
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
  loggedIn: (state): boolean => state.authStep === "authorized" && state.onboard.getState().wallet.provider && state.onboard.getState().address && walletData.get().syncWallet,
  getSelectedWallet: (state: ProviderModuleState): string | undefined => {
    return state.authStep !== "ready" && state.authStep !== "isSelecting" ? state.selectedWallet : undefined;
  },
  name: (state: ProviderModuleState): string => {
    const currentAddress: string = state.onboard.getState().address;
    if (state.authStep !== "authorized" || currentAddress.length < 2) {
      return "";
    }
    if (state.accountName) {
      return state.accountName as string;
    }
    return window.localStorage.getItem(currentAddress) || `${currentAddress.substr(0, 5)}...${currentAddress.substr(currentAddress!.length - 4, currentAddress!.length - 1)}`;
  },
  loader: (state: ProviderModuleState): boolean => ["walletSelected", "isChecking", "walletChecked", "isSelectingAccount", "accountSelected"].includes(state.authStep),
  address: (state: ProviderModuleState): Address | undefined =>
    state.authStep === "authorized" && state.onboard.getState().address.length > 1 ? (state.onboard.getState().address as Address) : undefined,
  loadingHint: (state: ProviderModuleState): string => state.loadingHint,
  zkScanUrl: (state: ProviderModuleState): string | undefined =>
    state.onboard.getState().address ? `${APP_ZKSYNC_BLOCK_EXPLORER}/accounts/${state.onboard.getState().address}` : undefined,
});

export const actions = actionTree(
  { state, getters, mutations },
  {
    authState({ state }): UserState {
      return state.onboard.getState();
    },
    saveName({ state, commit, getters }, name: string | undefined = undefined): void {
      const currentAddress: Address | undefined = getters.address;
      if (currentAddress !== undefined) {
        if (!name || !name.trim()) {
          name = window.localStorage.getItem(currentAddress)!.trim();
        }
        commit("setName", name);
      }
    },

    async walletSelect({ state, commit }): Promise<boolean> {
      commit("setAuthStage", "isSelecting");
      const result: boolean = await state.onboard.walletSelect();
      commit("setAuthStage", result ? "walletSelected" : "ready");
      return result;
    },

    async walletCheck({ state, commit }): Promise<boolean> {
      commit("setAuthStage", "isChecking");
      commit("setLoadingHint", "Follow the instructions in your Ethereum wallet");
      const result: boolean = await state.onboard.walletCheck();
      commit("setAuthStage", result ? "walletChecked" : "walletSelected");
      return result;
    },

    async accountSelect({ state, commit }): Promise<boolean> {
      commit("setAuthStage", "isSelectingAccount");
      const result: boolean = await state.onboard.accountSelect();
      commit("setAuthStage", result ? "accountSelected" : "walletChecked");
      return result;
    },

    reset({ state, commit }) {
      state.onboard.walletReset();
      commit("storeSelectedWallet", undefined);
      commit("setAuthStage", "ready");
    },

    async login({ state, dispatch, commit, getters }, forceReset = false): Promise<UserState> {
      if (forceReset) {
        console.log("forced");
        this.app.$accessor.provider.reset();
      }

      if (getters.loggedIn) {
        return state.onboard.getState();
      }

      console.log(state);
      if (state.authStep === "ready") {
        const selectResult: boolean = await this.app.$accessor.provider.walletSelect();
        console.log(state);
        if (!selectResult) {
          return state.onboard.getState();
        }
      }
      console.log("check", state);
      const checkResult: boolean = await this.app.$accessor.provider.walletCheck();
      if (!checkResult) {
        this.app.$accessor.provider.reset();
        return state.onboard.getState();
      }
      console.log(state);
      const authState: UserState = state.onboard.getState();
      if (authState.wallet?.type === "hardware") {
        const accountSelection: boolean = await this.app.$accessor.provider.accountSelect();
        if (!accountSelection) {
          this.app.$accessor.provider.reset();
        }
      }
      return state.onboard.getState();
    },
  },
);
