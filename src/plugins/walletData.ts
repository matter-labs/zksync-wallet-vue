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
    internalWalletData.zkSync = val?.zkSync;
    internalWalletData.syncProvider = val?.syncProvider;
    internalWalletData.syncWallet = val?.syncWallet;
    internalWalletData.accountState = val?.accountState;
  },
};
