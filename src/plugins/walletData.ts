import { iWalletData, iWalletWrapper } from "@/plugins/types";

const internalWalletData: iWalletData = {
  syncProvider: undefined,
  syncWallet: undefined,
  accountState: undefined,
};

/**
 * Wrapper for the major Providers
 * @type iWalletWrapper
 */
export const walletData: iWalletWrapper = {
  get: () => internalWalletData,

  set: (val): void => {
    internalWalletData.syncProvider = val?.syncProvider;
    internalWalletData.syncWallet = val?.syncWallet;
    internalWalletData.accountState = val?.accountState;
  },
  setProvider: (importedProvider): void => {
    internalWalletData.syncProvider = importedProvider;
  },
};
