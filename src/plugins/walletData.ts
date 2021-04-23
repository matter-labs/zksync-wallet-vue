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

  set: (val) => {
    if (Object.prototype.hasOwnProperty.call(val, "syncProvider")) {
      internalWalletData.syncProvider = val.syncProvider;
    }
    if (Object.prototype.hasOwnProperty.call(val, "syncWallet")) {
      internalWalletData.syncWallet = val.syncWallet;
    }
    if (Object.prototype.hasOwnProperty.call(val, "accountState")) {
      internalWalletData.accountState = val.accountState;
    }
  },
};
