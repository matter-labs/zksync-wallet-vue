/* eslint-disable require-await */
import type { GetterTree, MutationTree, ActionTree } from "vuex";

import Onboard from "@web3-onboard/core";
import type { OnboardAPI } from "@web3-onboard/core";
import injectedModule from "@web3-onboard/injected-wallets";
import fortmaticModule from "@web3-onboard/fortmatic";
import gnosisModule from "@web3-onboard/gnosis";
import mewModule from "@web3-onboard/mew-wallet";
import portisModule from "@web3-onboard/portis";
import torusModule from "@web3-onboard/torus";
import coinbaseWalletModule from "@web3-onboard/coinbase";
import keepkeyModule from "@web3-onboard/keepkey";
import ledgerModule from "@web3-onboard/ledger";
import trezorModule from "@web3-onboard/trezor";
import dcentModule from "@web3-onboard/dcent";
import walletConnectModule from "@web3-onboard/walletconnect";
import type { IConnector } from "@walletconnect/types";
import WalletConnectProvider from "@walletconnect/web3-provider";

import { ethers } from "ethers";
import type { JsonRpcError } from "json-rpc-engine";
import { Wallet, RemoteWallet, RestProvider } from "zksync";
import type { ExternalProvider } from "@ethersproject/providers";
import { Address } from "zksync/build/types";
import { config, ethereumNetworkConfig, zkSyncNetworkConfig } from "@/utils/config";
import { ModuleOptions, ZkOnboardStatus, ZkLoginOptions, ZkEthereumNetwork, ZkEthereumNetworkConfig, ZkConfig } from "@/types/zksync";
import { isMobileDevice } from "@/utils";

const loginOptionsDefaults: ZkLoginOptions = {
  requireSigner: false,
  requestAccountState: true,
  autoUpdateAccountState: true,
  requestTransactionHistory: true,
};

let onboard: OnboardAPI | undefined;
let onboardWalletUpdatesUnsubscribe: () => void | undefined;
let ethereumProvider: ExternalProvider | undefined;
let web3Provider: ethers.providers.Web3Provider | undefined;
let wc1Provider: WalletConnectProvider | undefined;
let networkChange = {
  resolve: <((result: boolean) => void) | undefined>undefined,
  reject: <((result: boolean) => void) | undefined>undefined,
};

const getWalletName = () => {
  const wcName = (onboard?.state.get().wallets[0].provider as any)?.connector?.peerMeta?.name;
  if (wcName === "Argent") {
    return "Argent";
  }
  return onboard?.state.get().wallets[0].label;
};

export type OnboardState = {
  loginOptions: ZkLoginOptions;
  selectedWallet?: string;
  loadingHint?: string;
  wrongNetwork: boolean;
  options: ModuleOptions;
  onboardTheme: "light" | "dark";
  onboardInited: boolean;
  onboardStatus: ZkOnboardStatus;
  restoringSession: boolean;
  error: string;
  forceUpdateValue: number;
};

export const state = (options: ModuleOptions): OnboardState => ({
  loginOptions: loginOptionsDefaults,
  selectedWallet: undefined,
  loadingHint: undefined,
  wrongNetwork: false,
  options,
  onboardTheme: "light",
  onboardInited: false,
  onboardStatus: "initial",
  restoringSession: false,
  error: "",
  forceUpdateValue: Number.MIN_SAFE_INTEGER,
});

export const getters: GetterTree<OnboardState, OnboardState> = {
  loginOptions: (state) => state.loginOptions,
  selectedWallet: (state) => state.selectedWallet,
  loadingHint: (state) => state.loadingHint,
  wrongNetwork: (state) => state.wrongNetwork,
  onboard: (state) => {
    // eslint-disable-next-line no-unused-expressions
    state.forceUpdateValue;
    return onboard;
  },
  options: (state) => state.options,
  onboardStatus: (state) => state.onboardStatus,
  onboardInited: (state) => state.onboardInited,
  restoringSession: (state) => state.restoringSession,
  error: (state) => state.error,
  wcProvider: (state) => {
    // eslint-disable-next-line no-unused-expressions
    state.forceUpdateValue;
    if (wc1Provider) {
      return wc1Provider.connector;
    }
    if ((ethereumProvider as any)?.connector?.protocol !== "wc") {
      return;
    }
    return (ethereumProvider as any)?.connector as IConnector;
  },
  ethereumProvider: (state) => {
    // eslint-disable-next-line no-unused-expressions
    state.forceUpdateValue;
    return ethereumProvider;
  },
  web3Provider: (state) => {
    // eslint-disable-next-line no-unused-expressions
    state.forceUpdateValue;
    return web3Provider;
  },
  wc1Provider: (state) => {
    // eslint-disable-next-line no-unused-expressions
    state.forceUpdateValue;
    return wc1Provider;
  },
  ethereumNetworksConfig: (state) => ethereumNetworkConfig(state.options.apiKeys.INFURA_KEY),
  config: (state, _, __, rootGetters) => config(rootGetters["zk-provider/network"], state.options),
};

export const mutations: MutationTree<OnboardState> = {
  setLoginOptions: (state, loginOptions?: ZkLoginOptions) => {
    state.loginOptions = Object.assign(loginOptionsDefaults, loginOptions);
  },
  setSelectedWallet: (state, walletName?: string) => {
    state.selectedWallet = walletName;
    if (walletName) {
      localStorage.setItem("lastSelectedWallet", walletName);
    } else {
      localStorage.removeItem("lastSelectedWallet");
    }
  },
  setLoadingHint: (state, loadingHint: string) => (state.loadingHint = loadingHint),
  setWrongNetwork: (state, wrongNetwork: boolean) => (state.wrongNetwork = wrongNetwork),
  setOnboard: (state, onboardInstance: OnboardAPI) => {
    state.forceUpdateValue++;
    onboard = onboardInstance;
  },
  setOnboardTheme: (state, theme: "light" | "dark") => {
    state.onboardTheme = theme;
    if (onboard) {
      onboard.state.actions.updateTheme(theme);
    }
  },
  setOnboardStatus: (state, status: ZkOnboardStatus) => (state.onboardStatus = status),
  setOnboardInited: (state, status: boolean) => (state.onboardInited = status),
  setRestoringSession: (state, status: boolean) => (state.restoringSession = status),
  setError: (state, error: string) => (state.error = error),
  setEthereumProvider: (state, ethProvider: ExternalProvider) => {
    ethereumProvider = ethProvider;
    state.forceUpdateValue++;
  },
  setWeb3Provider: (state, ethWeb3Provider: ethers.providers.Web3Provider) => {
    web3Provider = ethWeb3Provider;
    state.forceUpdateValue++;
  },
  clear: (state) => {
    state.selectedWallet = undefined;
    state.loadingHint = undefined;
    networkChange = {
      resolve: undefined,
      reject: undefined,
    };
    ethereumProvider = undefined;
    state.forceUpdateValue++;
  },
};

export const actions: ActionTree<OnboardState, OnboardState> = {
  async onboardInit({ state, commit, getters }) {
    commit(
      "setOnboard",
      Onboard({
        theme: state.onboardTheme,
        wallets: [
          injectedModule(),
          walletConnectModule(),
          ledgerModule(),
          trezorModule({
            email: "support@zksync.io",
            appUrl: "https://wallet.zksync.io",
          }),
          coinbaseWalletModule(),
          fortmaticModule({ apiKey: getters.options.apiKeys.FORTMATIC_KEY }),
          portisModule({ apiKey: getters.options.apiKeys.PORTIS_KEY }),
          keepkeyModule(),
          torusModule(),
          gnosisModule(),
          mewModule(),
          dcentModule(),
        ],
        chains: Object.entries(getters.ethereumNetworksConfig as ZkEthereumNetworkConfig).map(([key, value]) => ({
          id: "0x" + value.id.toString(16),
          token: "ETH",
          label: key,
          rpcUrl: value.rpc_url,
        })),
        appMetadata: {
          name: "zkSync",
          // eslint-disable-next-line quotes
          icon: `<svg width="237" height="237" viewBox="0 0 237 237" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M231.8 115.4L168.6 52.3V100.1L103.7 147.9H168.6V182.6L233.9 117.5L231.8 115.4Z" stroke="#4E5299" stroke-width="4.0312" stroke-miterlimit="10"/><path d="M68.7998 87.1001V52.3L3.2998 117.5L68.7998 182.6V135.4L133.7 87.1001H68.7998Z" stroke="#8B8CFB" stroke-width="4.0312" stroke-miterlimit="10"/></svg>`,
          logo: "https://firebasestorage.googleapis.com/v0/b/zksync-vue-mainnet.appspot.com/o/zksync-lite-logo-colored.svg?alt=media&token=e36a9484-abc1-46af-8003-aedc95c11438",
          description: "zkSync - Rely on math, not validators",
          gettingStartedGuide: "https://docs.zksync.io/userdocs/",
          explore: "https://zksync.io/",
          recommendedInjectedWallets: [{ name: "MetaMask", url: "https://metamask.io" }],
        },
        accountCenter: {
          desktop: {
            enabled: false,
          },
          mobile: {
            enabled: false,
          },
        },
      }),
    );

    if (window && window.ethereum) {
      window.ethereum.autoRefreshOnNetworkChange = false;
    }
    commit("setOnboardInited", true);
  },
  async getLastLoginData({ commit }) {
    const lastSelectedWallet = localStorage.getItem("lastSelectedWallet");
    if (lastSelectedWallet) {
      commit("setSelectedWallet", lastSelectedWallet);
    }
  },
  async walletCheck({ dispatch }) {
    if (!onboard) {
      console.warn("Onboard wasn't initialized with zk-onboard/onboardInit");
      return false;
    }
    return await dispatch("checkRightNetwork");
  },
  async onAddressChange({ getters, commit, dispatch, rootGetters }, { address }: { address: Address }) {
    // Was logged in
    if (rootGetters["zk-account/address"] && rootGetters["zk-account/address"]?.toLowerCase() !== address.toLowerCase()) {
      commit("setLoadingHint", "Switching accounts...");
      commit("setOnboardStatus", "connecting");
      await dispatch("zk-account/clearAccountData", null, { root: true });
      if (getters.selectedWallet === "Argent") {
        await dispatch("loginWithWC1");
      } else {
        await dispatch("loginWithOnboard", getters.selectedWallet);
      }
    }
  },
  async accountSelect() {
    if (!onboard) {
      console.warn("Onboard wasn't initialized with zk-onboard/onboardInit");
      return false;
    }
    /* return await onboard.accountSelect(); */
  },
  async reset({ commit, dispatch }) {
    dispatch("wc1Disconnect");
    commit("setOnboardStatus", "initial");
    commit("setSelectedWallet", undefined);
    localStorage.removeItem("walletconnect");
    onboardWalletUpdatesUnsubscribe && onboardWalletUpdatesUnsubscribe();
    if (onboard?.state.get()?.wallets.length) {
      const [primaryWallet] = onboard.state.get().wallets;
      await onboard.disconnectWallet({ label: primaryWallet.label });
    }
  },
  async rejectNetworkChange({ commit }) {
    commit("setWrongNetwork", false);
    if (networkChange.reject) {
      networkChange.reject(true);
    }
  },
  async loginWithArgent({ commit, dispatch }) {
    commit("setSelectedWallet", "Argent");
    return await dispatch("loginWithWC1");
  },
  async loginWithWalletConnect({ commit, dispatch }) {
    commit("setSelectedWallet", undefined);
    return await dispatch("loginWithOnboard", "WalletConnect");
  },
  async checkRightNetwork({ getters, commit }) {
    try {
      await new Promise((resolve, reject) => {
        networkChange.resolve = resolve;
        networkChange.reject = reject;

        const network = getters.config.ethereumNetwork as ZkEthereumNetwork;
        const walletChainId = wc1Provider?.chainId ?? parseInt(onboard?.state.get().wallets[0].chains[0].id ?? "", 16);
        if (walletChainId === network.id) {
          commit("setWrongNetwork", false);
          return resolve(true);
        }
        commit("setWrongNetwork", true);

        const isWC = !!wc1Provider || (onboard?.state.get().wallets[0].provider as any)?.connector?.protocol === "wc";
        if (isWC) {
          return reject(new Error("WalletConnect does not support network switching"));
        }

        if (onboard) {
          const chainId = ethers.utils.hexValue(network.id);
          onboard.state
            .get()
            .wallets[0].provider.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId }],
            })
            .then(() => {
              commit("setWrongNetwork", false);
              resolve(true);
            })
            .catch((switchError: any) => {
              if (!switchError) {
                return reject(new Error("Unable to switch network"));
              }

              if ((switchError as JsonRpcError<unknown>).code !== 4902 && (switchError as any).data?.originalError?.code !== 4902) {
                return reject(switchError);
              }

              if (!onboard) {
                return reject(new Error("Onboard not initialized"));
              }
              onboard.state
                .get()
                .wallets[0].provider.request({
                  method: "wallet_addEthereumChain",
                  params: [
                    {
                      chainId,
                      chainName: network.name.charAt(0).toUpperCase() + network.name.slice(1),
                      nativeCurrency: {
                        name: "Ether",
                        symbol: "ETH",
                        decimals: 18,
                      },
                      rpcUrls: [network.rpc_url],
                      blockExplorerUrls: [network.rpc_url],
                      iconUrls: ["https://ethereum.org/favicon-32x32.png"],
                    },
                  ],
                })
                .then(() => {
                  commit("setWrongNetwork", false);
                  resolve(true);
                });
            });
        }
      });
      return true;
    } catch (err) {
      console.warn("checkRightNetwork error: \n", err);
      return false;
    }
  },
  async subscribeForOnboardWalletUpdates({ getters, commit, dispatch }) {
    const state = onboard!.state.select("wallets");
    const { unsubscribe } = state.subscribe(async (wallets) => {
      if (!wallets.length) {
        commit("setSelectedWallet", undefined);
        dispatch("zk-account/logout", null, { root: true });
        if (getters.options.logoutRedirect) {
          this.$router.push(getters.options.logoutRedirect);
        }
        return;
      }
      // @ts-ignore
      wallets[0].provider.autoRefreshOnNetworkChange = false;
      commit("setSelectedWallet", wallets[0].label);
      await dispatch("onAddressChange", { address: wallets[0].accounts[0].address });
    });
    onboardWalletUpdatesUnsubscribe = () => {
      try {
        unsubscribe();
      } catch (_) {}
    };
  },
  async loginWithOnboard({ getters, commit, dispatch }, walletName?: string) {
    if (!getters.onboardInited) {
      await dispatch("onboardInit");
    }
    if (!onboard!.state.get().wallets.length) {
      await onboard!.connectWallet(
        walletName
          ? {
              autoSelect: { label: walletName, disableModals: true },
            }
          : undefined,
      );
    }
    const wallets = onboard!.state.get().wallets;
    if (!wallets.length) {
      return dispatch("reset");
    } else if (getWalletName() === "Argent") {
      commit("setError", "Use Argent Connect button instead");
      return dispatch("reset");
    }
    dispatch("subscribeForOnboardWalletUpdates");
    commit("setSelectedWallet", getWalletName());
    const disabledWallet = (getters.options as ModuleOptions).disabledWallets!.find((e) => e.name === getters.selectedWallet);
    if (disabledWallet) {
      commit("setError", disabledWallet.error);
      return dispatch("reset");
    }
    const checkResult = await dispatch("walletCheck");
    if (!checkResult) {
      return dispatch("reset");
    }
    return await dispatch("login", wallets[0].provider);
  },
  async loginWithWC1({ commit, dispatch, getters }) {
    const projectConfig: ZkConfig = getters.config;
    wc1Provider = new WalletConnectProvider({
      infuraId: projectConfig.infuraAPIKey,
      pollingInterval: 10000,
      qrcode: !(getters.selectedWallet === "Argent" && isMobileDevice()),
      chainId: projectConfig.ethereumNetwork.id,
      qrcodeModalOptions:
        getters.selectedWallet === "Argent"
          ? {
              mobileLinks: ["argent"],
            }
          : {},
    });

    try {
      if (!wc1Provider) {
        throw new Error("Provider not found");
      }

      wc1Provider.connector.on("display_uri", (err, _) => {
        if (err) {
          return console.warn("providerWalletConnect.connector display_uri error\n", err);
        }
        if (getters.selectedWallet === "Argent" && isMobileDevice()) {
          dispatch("zk-wallet/openWalletApp", null, { root: true });
        }
      });

      wc1Provider.on("accountsChanged", async (accounts: string[]) => {
        await dispatch("onAddressChange", { address: accounts[0] });
      });

      wc1Provider.on("chainChanged", (chainId: number) => {
        if (networkChange.resolve && chainId === (<ZkConfig>getters.config).ethereumNetwork.id) {
          networkChange.resolve(true);
        }
      });

      await wc1Provider.enable();
      if (wc1Provider.walletMeta?.name !== "Argent") {
        throw new Error(`To use "${wc1Provider.walletMeta?.name}" use WalletConnect button instead`);
      }
      commit("setSelectedWallet", wc1Provider.walletMeta?.name);
      if (wc1Provider.chainId !== (<ZkConfig>getters.config).ethereumNetwork.id) {
        commit("setWrongNetwork", true);
        try {
          await new Promise((resolve, reject) => {
            networkChange.resolve = resolve;
            networkChange.reject = reject;
          });
          return await dispatch("login", wc1Provider);
        } catch (_) {
          return false;
        } finally {
          commit("setWrongNetwork", false);
        }
      } else {
        return await dispatch("login", wc1Provider);
      }
    } catch (error) {
      console.warn("walletConnectLogin error: \n", error);
      commit("setError", error);
      await dispatch("reset");
      return false;
    }
  },
  async login({ getters, commit, dispatch }, ethProvider?: ExternalProvider) {
    if (!ethProvider) {
      return dispatch("reset");
    }
    const options: ZkLoginOptions = getters.loginOptions;
    /* zkSync log in process */
    commit("setEthereumProvider", ethProvider);
    commit("setLoadingHint", "Processing...");
    commit("setOnboardStatus", "connecting");
    let syncProvider: RestProvider;
    try {
      syncProvider = await dispatch("zk-provider/requestProvider", null, { root: true });
    } catch (error) {
      dispatch("zk-account/logout", null, { root: true });
      return dispatch("reset");
    }
    web3Provider = new ethers.providers.Web3Provider(ethProvider, "any");
    commit("setWeb3Provider", web3Provider);
    const ethWallet = web3Provider.getSigner();
    if (options.requireSigner) {
      commit("setLoadingHint", "Follow the instructions in your Ethereum wallet");
    }
    let syncWallet: Wallet | RemoteWallet | undefined;
    if (getters.selectedWallet === "Argent") {
      commit("zk-wallet/setRemoteWallet", true, { root: true });
      syncWallet = await RemoteWallet.fromEthSigner(web3Provider, syncProvider);
    } else {
      syncWallet = await Wallet[options.requireSigner ? "fromEthSigner" : "fromEthSignerNoKeys"](ethWallet, syncProvider);
      commit("zk-wallet/setRemoteWallet", false, { root: true });
    }
    if (!syncWallet) {
      return dispatch("reset");
    }
    commit("setLoadingHint", "Getting wallet information...");

    /* Set account data */
    commit("zk-account/setAddress", syncWallet.address(), { root: true });
    commit("zk-wallet/setSyncWallet", syncWallet, { root: true });
    commit("zk-account/setLoggedIn", true, { root: true });

    /* Get needed initial data */
    dispatch("zk-account/setInitialName", null, { root: true });
    if (options.requestAccountState) {
      dispatch("zk-account/updateAccountState", null, { root: true });
      dispatch("zk-wallet/checkCPK", null, { root: true });
    }
    if (options.autoUpdateAccountState) {
      dispatch("zk-account/autoUpdateAccountState", 30000, { root: true });
    }
    if (options.requestTransactionHistory) {
      dispatch("zk-history/getTransactionHistory", null, { root: true });
    }
    dispatch("zk-tokens/loadZkTokens", null, { root: true });
    dispatch("zk-contacts/requestContacts", null, { root: true });

    commit("setOnboardStatus", "authorized");
    return true;
  },
  async restoreLastNetwork({ commit }) {
    const lastSelectedNetwork = localStorage.getItem("lastSelectedNetwork");
    if (lastSelectedNetwork && Object.prototype.hasOwnProperty.call(zkSyncNetworkConfig, lastSelectedNetwork)) {
      commit("zk-provider/setNetwork", lastSelectedNetwork, { root: true });
    }
  },
  async restoreLogin({ getters, commit, dispatch }) {
    commit("setRestoringSession", true);
    commit("setLoadingHint", "Restoring session...");
    if (getters.options.restoreNetwork) {
      await dispatch("restoreLastNetwork");
    }
    await dispatch("getLastLoginData");
    let loginResult = false;
    if (getters.selectedWallet === "Argent") {
      loginResult = await dispatch("loginWithWC1");
    } else {
      loginResult = await dispatch("loginWithOnboard", getters.selectedWallet);
    }
    commit("setRestoringSession", false);
    return loginResult;
  },
  async wc1Disconnect() {
    try {
      if (wc1Provider && (wc1Provider.isConnecting || wc1Provider.connected) && wc1Provider.disconnect) {
        await wc1Provider.disconnect();
      }
      wc1Provider = undefined;
    } catch (error) {
      console.warn("Error disconnecting from WalletConnect v1\n", error);
    }
  },
};

export default (options: ModuleOptions) => ({
  namespaced: true,
  state: state(options),
  getters,
  mutations,
  actions,
});
