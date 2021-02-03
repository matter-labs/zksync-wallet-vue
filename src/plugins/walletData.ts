import { Provider, Wallet, AccountState } from "@/plugins/types";

interface walletData {
  [key: string]: object | undefined;
  syncProvider?: Provider;
  syncWallet?: Wallet;
  accountState?: AccountState;
  zkSync?: object;
}
const internalWalletData: walletData = {
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
  get: (): walletData => {
    return internalWalletData;
  },
  set: (val: object): void => {
    for (const [key, value] of Object.entries(val)) {
      internalWalletData[key] = value;
    }
  },
};
