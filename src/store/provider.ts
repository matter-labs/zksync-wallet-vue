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
  zkScanUrl: (state: ProviderModuleState): string | undefined => (state.address ? `${APP_ZKSYNC_BLOCK_EXPLORER}/accounts/${state.address}` : undefined),
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
      const providerWalletConnect = new WalletConnectProvider({
        infuraId: ONBOARD_INFURA_KEY,
        pollingInterval: 6500,
        qrcode: true,
        chainId: ETHER_NETWORK_ID,
      });

      try {
        if (!providerWalletConnect) {
          throw new Error("Provider not found");
        }

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

        if (providerWalletConnect.connected || providerWalletConnect.isConnecting) {
          await providerWalletConnect.disconnect();
        }

        //  Enable session (triggers QR Code modal)
        const response = await providerWalletConnect.enable();

        if (response && Array.isArray(response) && response[0]) {
          commit("setAddress", response[0]);
        }

        // @ts-ignore
        const web3Provider: Web3 = new Web3(providerWalletConnect);
        return await this.app.$accessor.provider.__internalLogin(web3Provider);
      } catch (error) {
        console.log(error);
        if (providerWalletConnect!.isConnecting || providerWalletConnect!.connected) {
          await providerWalletConnect.disconnect();
        }
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
          throw new Error("No wallet selected");
        }
        commit("setAuthStage", "walletSelected");
        const checkResult: boolean = await state.onboard.walletCheck();
        if (!checkResult) {
          throw new Error("Wallet check failed");
        }
        commit("setAuthStage", "walletChecked");
        const authState: UserState = state.onboard.getState();

        if (authState.wallet?.type === "hardware") {
          const accountSelection: boolean = await state.onboard.accountSelect();
          if (!accountSelection) {
            throw new Error("Failed to choose the account");
          }
          //          commit("setAddress", state.onboard.getState().address);
        } else {
          //          commit("setAddress", authState.address);
        }

        console.log("authorisation started");
        const incomingProvider = state.onboard.getState().wallet.provider;

        if (!incomingProvider) {
          throw new Error("Provider not found");
        }

        const web3Provider: Web3 = new Web3(incomingProvider);
        return await this.app.$accessor.provider.__internalLogin(web3Provider);
      } catch (error) {
        console.log(error);
        if (state.onboard.getState().wallet!.provider!.disconnect) {
          state.onboard.getState().wallet!.provider!.disconnect();
        }

        this.app.$accessor.wallet.logout();
        return false;
      }
    },

    async __internalLogin({ dispatch, state, getters, commit }, web3Provider: Web3): Promise<boolean | void | UserState> {
      /**
       * Pre-run check: in case the __internalLogin method is called when the auth state doesn't allow to login
       **/

      if (state.authStep === "ready") {
        return;
      }
      try {
        console.log("internal login called");

        /**
         * If no syncWallet or syncProvider fetched (supposed to be called once
         **/
        if (!walletData.get().syncWallet) {
          console.log("provider:", web3Provider);
          if (!web3Provider.eth!.currentProvider) {
            throw new Error("Web3 Provider has no Eth-network connection unavailable");
          }
          commit("setLoadingHint", "Follow the instructions in your wallet");

          /**
           * Step #2: requesting an access to the accounts
           **/

          console.log(web3Provider.eth);

          const fetchedAccounts = await web3Provider.eth.getAccounts();
          console.log(fetchedAccounts);
          if (!fetchedAccounts) {
            throw new Error("No account found");
          }

          const walletAccount = fetchedAccounts.shift();

          console.log("requested accounts", fetchedAccounts, walletAccount);

          /**
           * Step #3: request access to the account
           **/

          console.log("fetched accounts: ", fetchedAccounts);

          const ethWallet: providers.Web3Provider = new providers.Web3Provider(web3Provider.eth!.currentProvider as ExternalProvider, ETHER_NETWORK_ID);

          console.log(ethWallet);

          const syncProvider = await walletData.syncProvider.get();
          if (!syncProvider) {
            throw new Error("Connection to L2 SyncProvider failed");
          }

          console.log("Provider", syncProvider);

          const syncWallet = await Wallet.fromEthSigner(ethWallet.getSigner(walletAccount), syncProvider);

          console.log("newSyncWallet", syncWallet);

          walletData.set({
            syncWallet,
          });

          commit("setLoadingHint", "Follow the instructions in your wallet");
        }

        /* The user can press Cancel login anytime so we need to check if he did after every long action (request) */
        if (!walletData.get().syncWallet) {
          throw new Error("Sync Wallet not found");
        }

        this.app.$accessor.provider.setLoadingHint("Getting wallet information...");

        const accountState: AccountState | undefined = await walletData.get().syncWallet!.getAccountState();

        if (accountState === undefined) {
          throw new Error("Failed to get L2 wallet state");
        }

        console.log("accountState", accountState);

        commit("setAddress", accountState.address);

        walletData.set({
          accountState,
        });

        commit("setAuthStage", "authorized");

        console.log("login hint sent");

        await this.app.$accessor.wallet.preloadWallet();

        console.log(getters.loggedIn);

        if (!getters.loggedIn) {
          throw new Error("Account disconnected");
        }
        await this.$router.push("/account");
        return true;
      } catch (error) {
        console.warn(error);
        this.app.$accessor.wallet.logout();
        return false;
      }
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
          const web3Provider: Web3 = new Web3(wallet.provider);
          this.app.$accessor.provider.__internalLogin(web3Provider).then(
            (value) => {
              console.log(value);
            },
            (error) => {
              console.warn(error);
              this.app.$accessor.wallet.logout();
            },
          );
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
        console.log("before wallet check", state);
        this.app.$accessor.provider.onboard
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
