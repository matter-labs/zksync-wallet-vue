import onboardConfig from "@/configs/onboard";
import { APP_ZKSYNC_BLOCK_EXPLORER, ETHER_NETWORK_ID, ONBOARD_INFURA_KEY } from "@/plugins/build";
import { walletData } from "@/plugins/walletData";
import is from "@sindresorhus/is";
import WalletConnectProvider from "@walletconnect/web3-provider";

import Onboard from "bnc-onboard";
import { API, UserState, Wallet as OnboardWallet } from "bnc-onboard/dist/src/interfaces";
import { providers } from "ethers";

import { actionTree, getterTree, mutationTree } from "typed-vuex";
import { AccountState, Address } from "zksync/build/types";
import { Wallet } from "zksync/build/wallet";
import undefined = is.undefined;

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
  selectedWallet: <string | "">window.localStorage.getItem("onboardSelectedWallet") === null ? "" : (window.localStorage.getItem("onboardSelectedWallet") as string),
  loadingHint: <string>"",
  isProviderStored: <boolean>false,
  address: <Address | string>"",
});

export type ProviderModuleState = ReturnType<typeof state>;

export const mutations = mutationTree(state, {
  setAuthStage(state: ProviderModuleState, currentStep: tProviderState) {
    state.authStep = currentStep;
  },
  setAddress(state: ProviderModuleState, address: Address) {
    state.address = address;
  },
  storeSelectedWallet(state: ProviderModuleState, selectedWallet) {
    if (selectedWallet) {
      localStorage.setItem("onboardSelectedWallet", selectedWallet);
    }
    state.selectedWallet = selectedWallet;
  },
  setLoadingHint(state: ProviderModuleState, text: string) {
    state.loadingHint = text;
  },
  setName(state: ProviderModuleState, name?: string) {
    if (name) {
      state.accountName = name;
    }
  },
});

export const getters = getterTree(state, {
  loggedIn: (state): boolean => state.authStep === "authorized",
  getSelectedWallet: (state: ProviderModuleState): string => {
    return state.authStep !== "ready" && state.authStep !== "isSelecting" ? state.selectedWallet : "";
  },
  name: (state: ProviderModuleState): string => {
    const currentAddress: string = state.onboard.getState().address || state.address;
    if (state.authStep !== "authorized" || currentAddress!.length < 2) {
      return "";
    }
    if (state.accountName) {
      return state.accountName as string;
    }
    return window.localStorage.getItem(currentAddress) || `${currentAddress.substr(0, 5)}...${currentAddress.substr(currentAddress!.length - 4, currentAddress!.length - 1)}`;
  },
  loader: (state: ProviderModuleState): boolean => ["walletSelected", "isChecking", "walletChecked", "isSelectingAccount", "accountSelected"].includes(state.authStep),
  address: (state: ProviderModuleState): Address =>
    state.authStep === "authorized" && state.onboard.getState().address ? (state.onboard.getState().address as Address) : state.address,
  loadingHint: (state: ProviderModuleState): string => state.loadingHint,
  zkScanUrl: (state: ProviderModuleState): string => (state.onboard.getState().address ? `${APP_ZKSYNC_BLOCK_EXPLORER}/accounts/${state.onboard.getState().address}` : ""),
});

export const actions = actionTree(
  { state, getters, mutations },
  {
    authState({ state }): UserState {
      return state.onboard.getState();
    },
    saveName({ state, commit, getters }, name = ""): void {
      const currentAddress: Address | undefined = getters.address;
      if (!currentAddress) {
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
      commit("storeSelectedWallet", "");
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
      this.app.$accessor.wallet.logout();
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

        /**
         * Authorizing the wallet (better avoid since it's “async magic”
         */
        providerWalletConnect.onConnect((connection: unknown) => {
          commit("setAuthStage", "walletChecked");
          console.log(connection);
        });

        providerWalletConnect.on("session_request", (error: Error, payload: unknown): void => {
          if (error) {
            console.error(error);
          }
          commit("setAuthStage", "isChecking");
          commit("setLoadingHint", "Follow the instructions in your wallet");
          console.log(payload, "session_request");
        });

        providerWalletConnect.on("session_update", (error: Error, payload: unknown): void => {
          if (error) {
            console.error(error);
          }
          console.log("session_update", payload);
        });

        providerWalletConnect.on("disconnect", (error: Error, payload: unknown): void => {
          if (error) {
            console.error(error);
          }
          this.app.$accessor.wallet.logout();
          console.log("disconnect", payload);
        });

        if (providerWalletConnect.connected) {
          await providerWalletConnect.disconnect();
        }

        //  Enable session (triggers QR Code modal)
        const response = await providerWalletConnect.enable();

        console.log("response", response);

        if (response && Array.isArray(response) && response[0]) {
          commit("setAddress", response[0]);
        }

        if (!providerWalletConnect) {
          // @todo: consider implementation — it's all registered events
          //
          //      "session_request",
          //        "session_update",
          //        "exchange_key",
          //        "connect",
          //        "disconnect",
          //        "display_uri",
          //        "modal_closed",
          //        "transport_open",
          //        "transport_close",
          //        "transport_error",

          await this.app.$accessor.wallet.logout();
          return;
        }

        const address = providerWalletConnect.accounts[0] as Address;
        this.app.$accessor.provider.setAddress(address);

        if (walletData.get().syncWallet) {
          return true;
        }
        const ethWallet: providers.Web3Provider = new providers.Web3Provider(providerWalletConnect, ETHER_NETWORK_ID);
        this.app.$accessor.provider.setLoadingHint("Follow the instructions in your wallet");
        await this.app.$accessor.provider.__internalLogin(ethWallet);
      } catch (error) {
        console.log(error);
        this.app.$accessor.wallet.logout();
        return false;
      }
    },

    /**
     * Refreshing the wallet in case local storage keep token or signer fired event
     */
    async connectWithOnboard({ state }): Promise<boolean | void | UserState> {
      try {
        console.log(state);
        if (state.authStep === "ready") {
          const selectResult: boolean = await this.app.$accessor.provider.walletSelect();
          console.log(state);
          if (!selectResult) {
            this.app.$accessor.provider.reset();
            return false;
          }
        }
        console.log("check", state);
        const checkResult: boolean = await this.app.$accessor.provider.walletCheck();
        if (!checkResult) {
          this.app.$accessor.provider.reset();
          return false;
        }
        console.log(state);
        const authState: UserState = state.onboard.getState();
        if (authState.wallet?.type === "hardware") {
          const accountSelection: boolean = await this.app.$accessor.provider.accountSelect();
          if (!accountSelection) {
            this.app.$accessor.provider.reset();
          }
        }
        console.log("authorisation started");
        const incomingProvider = state.onboard.getState().wallet.provider;

        if (!incomingProvider) {
          this.app.$accessor.wallet.logout();
          return;
        }
        return await this.app.$accessor.provider.__internalLogin(incomingProvider);
      } catch (error) {
        console.log(error);
        this.app.$accessor.wallet.logout();
        return false;
      }
    },

    /**
     *
     * @param {any} dispatch
     * @param {any} state
     * @param {any} getters
     * @param {providers.Web3Provider} web3Provider
     * @return {Promise<boolean | void | UserState>}
     */
    async __internalLogin({ dispatch, state, getters }, web3Provider: providers.Web3Provider): Promise<boolean | void | UserState> {
      if (!web3Provider) {
        this.app.$accessor.wallet.logout();
        return false;
      }
      const syncProvider = await walletData.syncProvider.get();
      if (!syncProvider) {
        return false;
      }

      console.log("syncProvider", syncProvider);

      const syncWallet = await Wallet.fromEthSigner(web3Provider.getSigner(this.app.$accessor.provider.address), syncProvider);
      this.app.$accessor.provider.setAuthStage("authorized");

      walletData.set({
        syncWallet,
      });

      console.log("login hint sent");

      this.app.$accessor.provider.setLoadingHint("Getting wallet information...");

      /* Simplified event watcher call */
      const accountState: AccountState | undefined = await walletData.get().syncWallet!.getAccountState();

      walletData.set({
        accountState,
      });

      await this.app.$accessor.wallet.preloadWallet();

      console.log(getters.loggedIn);

      if (!getters.loggedIn) {
        return false;
      }
      this.$router.push("/account");
      return true;
    },

    onEventAddress({ getters }, address: string): void {
      console.log("subscription watcher (wallet): ", address);
      if (getters.loggedIn) {
        // @ts-ignore
        if ((address !== undefined && getters.address !== (address as Address)) || (getters.address !== undefined && address === undefined)) {
          this.app.$toast.global?.zkException({
            message: "Account switching spotted",
          });
          this.app.$accessor.wallet.logout();
        }
      }
    },
    onEventWallet({ state, commit }, wallet: OnboardWallet): void {
      console.log("subscription watcher (wallet): ", wallet.provider, wallet.instance);
      console.log(wallet.provider);
      if (wallet && wallet.provider) {
        console.log(wallet.provider);
        wallet.provider.autoRefreshOnNetworkChange = false;

        if (wallet.name) {
          commit("storeSelectedWallet", wallet.name);
        }
      }
    },
    onEventNetwork({ getters, state }, networkId: number): void {
      console.log("subscription watcher (network): ", networkId);
      if (getters.loggedIn) {
        if (!!networkId && networkId !== ETHER_NETWORK_ID) {
          this.app.$toast.global?.zkException({
            message: "ETH Network change spotted",
          });

          if (walletData.get().syncWallet) {
            if (state.onboard.getState().mobileDevice) {
              return;
            }
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
        }
      }
    },
  },
);
