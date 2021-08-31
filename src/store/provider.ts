import onboardConfig from "@/configs/onboard";
import { APP_ZKSYNC_BLOCK_EXPLORER, ETHER_NETWORK_ID, ONBOARD_INFURA_KEY } from "@/plugins/build";
import { walletData } from "@/plugins/walletData";
import { ExternalProvider } from "@ethersproject/providers";
import WalletConnectProvider from "@walletconnect/web3-provider";

import Onboard from "bnc-onboard";
import { API, UserState, Wallet as OnboardWallet } from "bnc-onboard/dist/src/interfaces";
import { providers } from "ethers";

import { actionTree, getterTree, mutationTree } from "typed-vuex";
import Web3 from "web3";
import { AccountState, Address } from "zksync/build/types";
import { Wallet } from "zksync/build/wallet";

export declare type tProviderState = "ready" | "isSelecting" | "walletSelected" | "isChecking" | "walletChecked" | "isSelectingAccount" | "accountSelected" | "authorized";

const onboard: API = Onboard({
  ...onboardConfig,
  subscriptions: {
    address: (address: string) => {
      window.$nuxt.$accessor.provider.onEventAddress(address);
    },
    wallet: (wallet: OnboardWallet) => {
      window.$nuxt.$accessor.provider.onEventWallet(wallet);
    },
    network: (networkId: number): void => {
      window.$nuxt.$accessor.provider.onEventNetwork(networkId);
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
  address: <Address | string | undefined>undefined,
});

export type ProviderModuleState = ReturnType<typeof state>;

export const mutations = mutationTree(state, {
  setAuthStage(state: ProviderModuleState, currentStep: tProviderState) {
    state.authStep = currentStep;
  },
  setAddress(state: ProviderModuleState, address?: Address) {
    state.address = address;
  },
  storeSelectedWallet(state: ProviderModuleState, selectedWallet?: string) {
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
  loggedIn: (state): boolean => {
    return !(state.authStep !== "authorized" || (!state.address && !state.onboard.getState().address));
  },
  getSelectedWallet: (state: ProviderModuleState): string | undefined => {
    return state.authStep !== "ready" && state.authStep !== "isSelecting" ? state.selectedWallet : undefined;
  },
  name: (state: ProviderModuleState): string => {
    const currentAddress: string | undefined = state.onboard.getState().address || state.address;
    if (state.authStep !== "authorized" || currentAddress!.length < 2) {
      return "";
    }
    if (state.accountName) {
      return state.accountName as string;
    }
    return currentAddress
      ? window.localStorage.getItem(currentAddress) || `${currentAddress.substr(0, 5)}...${currentAddress.substr(currentAddress!.length - 4, currentAddress!.length - 1)}`
      : "";
  },
  loader: (state: ProviderModuleState): boolean => ["walletSelected", "isChecking", "walletChecked", "isSelectingAccount", "accountSelected"].includes(state.authStep),
  address: (state: ProviderModuleState): Address | undefined =>
    state.authStep === "authorized" && state.onboard.getState().address ? (state.onboard.getState().address as Address) : state.address,
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
      localStorage.removeItem("walletconnect");
      state.onboard.walletReset();
      commit("setAddress", undefined);
      commit("storeSelectedWallet", undefined);
      commit("setAuthStage", "ready");
    },

    /**
     * Special auth for the WalletConnect SDK
     * @param {any} commit
     * @param {any} state
     * @param {any} getters
     * @return {Promise<boolean | void | UserState>}
     */
    async connectWithWalletConnect({ commit, state, getters }): Promise<boolean | void | UserState> {
      try {
        /**
         * Placing here the component code
         */
        const providerWalletConnect: WalletConnectProvider = new WalletConnectProvider({
          infuraId: ONBOARD_INFURA_KEY,
          pollingInterval: 500,
          qrcode: true,
          chainId: ETHER_NETWORK_ID,
        });

        await providerWalletConnect.updateState({
          chainId: ETHER_NETWORK_ID,
          networkId: ETHER_NETWORK_ID,
        });

        if (providerWalletConnect.connected) {
          await providerWalletConnect.disconnect();
        }

        //  Enable session (triggers QR Code modal)
        const response = await providerWalletConnect.enable();

        if (response && Array.isArray(response) && response[0]) {
          commit("setAddress", response[0]);
        }

        if (!providerWalletConnect) {
          await this.app.$accessor.wallet.logout();
          return;
        }

        return await this.app.$accessor.provider.__internalLogin(providerWalletConnect);
      } catch (error) {
        console.log(error);
        this.app.$accessor.wallet.logout();
        return false;
      }
    },

    /**
     * Refreshing the wallet in case local storage keep token or signer fired event
     */
    async connectWithOnboard({ state, commit }): Promise<boolean | void | UserState> {
      if (state.authStep !== "ready") {
        this.app.$accessor.provider.reset();
      }
      try {
        const selectResult: boolean = await state.onboard.walletSelect();
        if (!selectResult) {
          this.app.$accessor.wallet.logout();
          return false;
        }
        commit("setAuthStage", "walletSelected");
        const checkResult: boolean = await state.onboard.walletCheck();
        if (!checkResult) {
          this.app.$accessor.wallet.logout();
          return false;
        }
        commit("setAuthStage", "walletChecked");
        const authState: UserState = state.onboard.getState();

        if (authState.wallet?.type === "hardware") {
          const accountSelection: boolean = await state.onboard.accountSelect();
          if (!accountSelection) {
            this.app.$accessor.wallet.logout();
            return false;
          }
          commit("setAddress", state.onboard.getState().address);
        } else {
          commit("setAddress", authState.address);
        }

        console.log("authorisation started");
        const incomingProvider = state.onboard.getState().wallet.provider;

        if (!incomingProvider) {
          console.log("error");
          this.app.$accessor.wallet.logout();
          return false;
        }
        return await this.app.$accessor.provider.__internalLogin(incomingProvider);
      } catch (error) {
        console.log(error);
        if (state.onboard.getState().wallet!.provider!.disconnect) {
          state.onboard.getState().wallet!.provider!.disconnect();
        }

        this.app.$accessor.wallet.logout();
        return false;
      }
    },

    async __internalLogin({ dispatch, state, getters, commit }, provider: ExternalProvider | WalletConnectProvider): Promise<boolean | void | UserState> {
      if (state.authStep === "ready") {
        return;
      }
      console.log("internal login called");
      if (!walletData.get().syncWallet) {
        // @ts-ignore
        const web3Provider = new Web3(provider);

        console.log("provider:", web3Provider);
        if (!web3Provider.eth.currentProvider) {
          this.app.$accessor.wallet.logout();
          return false;
        }
        commit("setLoadingHint", "Follow the instructions in your wallet");

        console.log("account:", web3Provider.defaultAccount);

        console.log("let's create web3");

        const ethWallet: providers.Web3Provider = new providers.Web3Provider(provider as providers.ExternalProvider, ETHER_NETWORK_ID);

        console.log(ethWallet);

        const syncProvider = await walletData.syncProvider.get();
        if (!syncProvider) {
          this.app.$accessor.wallet.logout();
          return false;
        }

        console.log("Provider", syncProvider);

        const syncWallet = await Wallet.fromEthSigner(ethWallet.getSigner(), syncProvider);

        console.log("newSyncWallet", syncWallet);

        walletData.set({
          syncWallet,
        });

        commit("setLoadingHint", "Follow the instructions in your wallet");
        //      this.app.$accessor.provider.
      }

      /* The user can press Cancel login anytime so we need to check if he did after every long action (request) */
      if (!walletData.get().syncWallet) {
        this.app.$accessor.wallet.logout();
        return false;
      }

      this.app.$accessor.provider.setLoadingHint("Getting wallet information...");

      const accountState: AccountState | undefined = await walletData.get().syncWallet?.getAccountState();

      console.log("accountState", accountState);

      commit("setAddress", accountState?.address);

      walletData.set({
        accountState,
      });

      console.log("newSyncWallet", accountState);

      commit("setAuthStage", "authorized");

      console.log("login hint sent");

      await this.app.$accessor.wallet.preloadWallet();

      console.log(getters.loggedIn);

      if (!getters.loggedIn) {
        this.app.$accessor.wallet.logout();
        return false;
      }
      await this.$router.push("/account");
      return true;
    },

    onEventAddress({ getters }, address: string): void {
      console.log("subscription watcher (address): ", address);
      if (getters.loggedIn) {
        if ((address !== undefined && getters.address !== (address as Address)) || (getters.address !== undefined && address === undefined)) {
          this.app.$toast.global?.zkException({
            message: "Account switching spotted",
          });
          this.app.$accessor.wallet.logout();
        }
      }
    },
    onEventWallet({ state, commit }, wallet: OnboardWallet): void {
      console.log("subscription watcher (wallet): ", wallet);
      console.log(wallet.provider);
      if (wallet.provider && wallet.name) {
        console.log(wallet.provider);
        wallet.provider.autoRefreshOnNetworkChange = false;

        if (wallet.name) {
          commit("storeSelectedWallet", wallet.name);
        }
        console.log("wallet: ", wallet);

        try {
          this.app.$accessor.provider.__internalLogin(wallet.provider);
        } catch (error) {
          this.app.$accessor.wallet.logout();
        }
      }
    },
    onEventNetwork({ getters, state }, networkId: number): void {
      console.log("subscription watcher (network): ", networkId);
      if (getters.loggedIn && networkId !== ETHER_NETWORK_ID && networkId !== undefined) {
        this.app.$toast.global?.zkException({
          message: "ETH Network change spotted",
        });

        this.app.$accessor.provider
          .walletCheck()
          .then((checkState: boolean) => {
            if (checkState) {
              this.app.$accessor.provider.setAuthStage("authorized");
              this.$router.back();
            } else {
              this.app.$accessor.wallet.logout();
            }
          })
          .catch((reason: unknown) => {
            console.log(reason);
            this.app.$accessor.wallet.logout();
          });
      }
    },
  },
);
