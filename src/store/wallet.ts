/* eslint-disable require-await */
import type { GetterTree, MutationTree, ActionTree } from "vuex";
import { ethers } from "ethers";
import type { ExternalProvider } from "@ethersproject/providers";
import type { IConnector } from "@walletconnect/types";
import { RestProvider, Wallet, utils, RemoteWallet } from "zksync";
import { AccountState as WalletAccountState, Address, Network } from "zksync/build/types";
import { ModuleOptions, ZkCPKStatus, ZkCPKLocal, ZkSignCPKState } from "@/types/zksync";
import { filterError, getMobileOperatingSystem } from "../utils";
import DeepLinker from "../utils/deeplinker";

let syncWallet: Wallet | RemoteWallet;

function getCPKStorageKey(address: Address, network: Network) {
  return `pubKeySignature-${network}-${address}`;
}

export type ProviderState = {
  cpk: ZkCPKStatus;
  isRemoteWallet: boolean;
  hasSigner: boolean;
  cpkSignState: ZkSignCPKState;
  cpkSignError?: string;
  forceUpdateValue: number;
};

export const state = (_: ModuleOptions): ProviderState => ({
  cpk: false, // is account activated
  isRemoteWallet: false,
  hasSigner: false,
  cpkSignState: false,
  cpkSignError: undefined,
  forceUpdateValue: Number.MIN_SAFE_INTEGER,
});

export const getters: GetterTree<ProviderState, ProviderState> = {
  syncWallet: (state) => {
    // eslint-disable-next-line no-unused-expressions
    state.forceUpdateValue;
    return syncWallet;
  },
  cpk: (state) => state.cpk,
  isRemoteWallet: (state) => state.isRemoteWallet,
  cpkSignState: (state) => state.cpkSignState,
  cpkSignError: (state) => state.cpkSignError,
  cpkStorageKey: (_, __, ___, rootGetters) => getCPKStorageKey(rootGetters["zk-account/address"], rootGetters["zk-provider/network"]),
  hasSigner: (state) => state.hasSigner,
  forceUpdateValue: (state) => state.forceUpdateValue,
};

export const mutations: MutationTree<ProviderState> = {
  setSyncWallet: (state, wallet: Wallet | RemoteWallet) => {
    state.hasSigner = wallet.syncSignerConnected();
    syncWallet = wallet;
    state.forceUpdateValue++;
  },
  setCPK: (state, cpk: ZkCPKStatus) => (state.cpk = cpk),
  setRemoteWallet: (state, isRemote: boolean) => (state.isRemoteWallet = isRemote),
  setCPKSignState: (state, status: ZkSignCPKState) => (state.cpkSignState = status),
  setCPKSignError: (state, error?: string) => (state.cpkSignError = error),
  clear: (state) => {
    state.cpk = false;
    state.isRemoteWallet = false;
    state.hasSigner = false;
    state.cpkSignState = false;
    state.cpkSignError = undefined;
  },
};

export const actions: ActionTree<ProviderState, ProviderState> = {
  async checkCPK({ getters, dispatch, commit, rootGetters }, force = false): Promise<ZkCPKStatus> {
    if (rootGetters["zk-onboard/selectedWallet"] === "Argent") {
      commit("setCPK", true);
      return true;
    }
    if (!rootGetters["zk-account/accountStateRequested"]) {
      await dispatch("zk-account/updateAccountState", null, { root: true });
    }
    const accountState: WalletAccountState = force ? await dispatch("zk-account/updateAccountState", force, { root: true }) : rootGetters["zk-account/accountState"];
    if (!accountState) {
      commit("setCPK", false);
      return false;
    }
    let activated: boolean;
    if (syncWallet.syncSignerConnected()) {
      const newPubKeyHash = getters.isRemoteWallet ? await (<RemoteWallet>syncWallet).syncSignerPubKeyHash() : await (<Wallet>syncWallet).signer!.pubKeyHash();
      activated = accountState.committed.pubKeyHash === newPubKeyHash;
    } else {
      activated = accountState.committed.pubKeyHash !== "sync:0000000000000000000000000000000000000000";
    }
    if (activated) {
      commit("setCPK", true);
      return true;
    } else if (localStorage.getItem(getters.cpkStorageKey)) {
      let cpkTx;
      try {
        cpkTx = JSON.parse(localStorage.getItem(getters.cpkStorageKey)!);
      } catch (error) {
        console.warn("Error parsing local storage cpk\n", error);
        await dispatch("zk-wallet/removeLocalCPK", null, { root: true });
        commit("setCPK", false);
        return false;
      }
      const accountState: WalletAccountState = rootGetters["zk-account/accountState"];
      if (cpkTx.accountId !== accountState.id) {
        console.warn(`Wrong local CPK account id. Saved ${cpkTx.accountId}; current ${accountState.id}`);
        await dispatch("zk-wallet/removeLocalCPK", null, { root: true });
        commit("setCPK", false);
        return false;
      }
      if (cpkTx.nonce !== accountState.committed.nonce) {
        console.warn(`Wrong local CPK account nonce. Saved ${cpkTx.nonce}; current ${accountState.committed.nonce}`);
        await dispatch("zk-wallet/removeLocalCPK", null, { root: true });
        commit("setCPK", false);
        return false;
      }
      commit("setCPK", "signed");
      return "signed";
    }
    commit("setCPK", false);
    return false;
  },
  async signCPK({ getters, dispatch, commit, rootGetters }) {
    try {
      const checkResult = await dispatch("zk-onboard/checkRightNetwork", null, { root: true });
      if (!checkResult) {
        return;
      }
      commit("setCPKSignError", undefined);
      commit("setCPKSignState", "processing");
      await dispatch("checkCPK", true);
      if (getters.cpk !== false) {
        return;
      }
      await dispatch("zk-account/updateAccountState", true, { root: true });
      const accountState: WalletAccountState = rootGetters["zk-account/accountState"];
      if (typeof accountState.id !== "number") {
        throw new TypeError(
          "It is required to have a history of committed balances on the account to activate it. If you have deposited funds wait a while until they become available",
        );
      }
      if (!getters.isRemoteWallet && (<Wallet>syncWallet).ethSignerType?.verificationMethod === "ERC-1271") {
        const isOnchainAuthSigningKeySet = await syncWallet.isOnchainAuthSigningKeySet();
        if (!isOnchainAuthSigningKeySet) {
          const onchainAuthTransaction = await syncWallet.onchainAuthSigningKey();
          await onchainAuthTransaction?.wait();
        }
      }
      const newPubKeyHash = getters.isRemoteWallet ? await (<RemoteWallet>syncWallet).syncSignerPubKeyHash() : await (<Wallet>syncWallet).signer!.pubKeyHash();
      const changePubKeyMessage = utils.getChangePubkeyLegacyMessage(newPubKeyHash, accountState.committed.nonce, accountState.id!);
      commit("setCPKSignState", "waitingForUserConfirmation");
      const ethSignature = (await syncWallet.ethMessageSigner().getEthMessageSignature(changePubKeyMessage)).signature;
      commit("zk-transaction/setError", undefined, { root: true });
      commit("setCPKSignState", "updating");
      const changePubkeyTx: ZkCPKLocal = {
        accountId: accountState.id!,
        account: syncWallet.address(),
        newPkHash: newPubKeyHash,
        nonce: accountState.committed.nonce,
        ethSignature,
        validFrom: 0,
        validUntil: utils.MAX_TIMESTAMP,
      };
      await dispatch("saveLocalCPK", changePubkeyTx);
      await dispatch("checkCPK");
    } catch (error) {
      console.warn("Error signing local CPK\n", error);
      const realError = filterError(error as Error);
      if (realError) {
        commit("setCPKSignError", realError);
      }
    }
    commit("setCPKSignState", false);
  },
  async saveLocalCPK({ commit, rootGetters }, cpkTx: ZkCPKLocal) {
    localStorage.setItem(getCPKStorageKey(rootGetters["zk-account/address"], rootGetters["zk-provider/network"]), JSON.stringify(cpkTx));
    commit("setCPK", "signed");
  },
  async removeLocalCPK({ commit, getters, rootGetters }) {
    localStorage.removeItem(getCPKStorageKey(rootGetters["zk-account/address"], rootGetters["zk-provider/network"]));
    if (getters.cpk === "signed") {
      commit("setCPK", false);
    }
  },
  async requestSigner({ commit, dispatch, rootGetters }) {
    const checkResult = await dispatch("zk-onboard/checkRightNetwork", null, { root: true });
    if (!checkResult) {
      return;
    }
    const syncProvider: RestProvider = await dispatch("zk-provider/requestProvider", null, { root: true });
    const ethProvider: ExternalProvider = rootGetters["zk-onboard/ethereumProvider"];
    const ethWallet = new ethers.providers.Web3Provider(ethProvider).getSigner();
    const signedSyncWallet = await Wallet.fromEthSigner(ethWallet, syncProvider);
    commit("setSyncWallet", signedSyncWallet);
    await dispatch("checkCPK");
  },
  async openWalletApp({ rootGetters }) {
    if (!rootGetters["zk-onboard/wcProvider"]) {
      return;
    }
    const wcURI = (rootGetters["zk-onboard/wcProvider"] as IConnector).uri;
    const deviceOS = getMobileOperatingSystem();
    let windowURL: undefined | string;
    switch (deviceOS) {
      case "Android":
        windowURL = !rootGetters["zk-account/loggedIn"] ? wcURI : wcURI.substr(0, wcURI.indexOf("?bridge"));
        break;
      case "iOS":
        if (rootGetters["zk-onboard/selectedWallet"] === "Argent") {
          if (rootGetters["zk-provider/network"] === "mainnet") {
            windowURL = "https://argent.link/app/wc";
          } else {
            windowURL = "argent-dev://app/wc";
          }
        } else if (rootGetters["zk-onboard/selectedWallet"] === "MetaMask") {
          windowURL = "https://metamask.app.link/wc";
        }
        if (windowURL) {
          windowURL += `?uri=${encodeURIComponent(wcURI)}`;
        }
        break;
    }
    const linker = DeepLinker({
      onIgnored() {
        linker.destroy();
      },
      onFallback() {
        linker.destroy();
      },
      onReturn() {
        linker.destroy();
      },
    });
    if (windowURL) {
      linker.openURL(windowURL);
    }
  },
};

export default () => ({
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
});
