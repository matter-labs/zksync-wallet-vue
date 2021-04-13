import { iWalletData, iWalletWrapper } from "@/plugins/types";

const internalWalletData: iWalletData = {
  syncProvider: undefined,
  syncWallet: undefined,
  accountState: undefined,
};

/**
 * Wrapper for the major Providers
 * @type {{accountState: null, syncProvider: null, syncWallet: null}}
 */
export const walletData: iWalletWrapper = {
  get: (): iWalletData => {
    return internalWalletData;
  },

  set: (val: iWalletData): void => {
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
