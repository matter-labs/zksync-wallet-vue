import { iWalletData, iWalletWrapper } from "@/plugins/types";

const internalWalletData: iWalletData = {
  syncProvider: undefined,
  syncWallet: undefined,
  accountState: undefined,
  zkSync: undefined,
};

/**
 * Wrapper for the major Providers
 * @type iWalletWrapper
 */
export const walletData: iWalletWrapper = {
  zkSync: async () => {
    if (!process.client) {
      return undefined;
    }
    if (!internalWalletData.zkSync) {
      internalWalletData.zkSync = await import("zksync");
    }
    return internalWalletData.zkSync;
  },

  get: () => internalWalletData,

  set: (val): void => {
    internalWalletData.zkSync = val?.zkSync;
    internalWalletData.syncProvider = val?.syncProvider;
    internalWalletData.syncWallet = val?.syncWallet;
    internalWalletData.accountState = val?.accountState;
  },
  setProvider: (importedProvider): void => {
    internalWalletData.syncProvider = importedProvider;
  },
};
