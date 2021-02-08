import { AccountState, Provider, Wallet } from "@/plugins/types";

interface iWalletData {
  [key: string]: object | undefined;
  syncProvider?: Provider;
  syncWallet?: Wallet;
  accountState?: AccountState;
  zkSync?: object;
}

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
export const walletData = {
  /**
   * @return {Promise<null|*>}
   */
  zkSync: async (): Promise<any> => {
    if (!process.client) {
      return null;
    }
    if (!internalWalletData.zkSync) {
      internalWalletData.zkSync = await import("zksync");
    }
    return internalWalletData.zkSync;
  },

  /**
   * Getting the data
   * @returns {iWalletData}
   */
  get: (): iWalletData => {
    return internalWalletData;
  },

  /**
   * Setting walletData
   * @returns {iWalletData}
   */
  set: (val: iWalletData): void => {
    for (const [key, value] of Object.entries(val)) {
      internalWalletData[key] = value;
    }
  },
};
