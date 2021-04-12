import { iWalletData, zksync, iWalletWrapper } from "@/plugins/types";

const internalWalletData: iWalletData = {
  syncProvider: undefined,
  syncWallet: undefined,
  accountState: undefined,
  zkSync: undefined,
};

/**
 * Wrapper for the major Providers
 * @type {{accountState: null, syncProvider: null, syncWallet: null, zkSync: any|null}}
 */
export const walletData: iWalletWrapper = {
  zkSync: async (): Promise<zksync | undefined> => {
    if (!process.client) {
      return undefined;
    }
    if (!internalWalletData.zkSync) {
      internalWalletData.zkSync = await import("zksync");
    }
    return internalWalletData.zkSync;
  },

  get: (): iWalletData => {
    return internalWalletData;
  },

  set: (val: iWalletData): void => {
    if (typeof val.zkSync !== "undefined") {
      internalWalletData.zkSync = val.zkSync;
    }
    if (typeof val.syncProvider !== "undefined") {
      internalWalletData.syncProvider = val.syncProvider;
    }
    if (typeof val.syncWallet !== "undefined") {
      internalWalletData.syncWallet = val.syncWallet;
    }
    if (typeof val.accountState !== "undefined") {
      internalWalletData.accountState = val.accountState;
    }
  },
};
