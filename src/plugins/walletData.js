/**
 * Wrapper for the major Providers
 * @type {{accountState: null, syncProvider: null, syncWallet: null, zkSync: any|null}}
 */
const internalWalletData = {
  syncProvider: null,
  syncWallet: null,
  accountState: null,
  zkSync: null,
};

export const walletData = {
  zkSync: async () => {
    if (!process.client) {
      return null;
    }
    if (!internalWalletData["zkSync"]) {
      internalWalletData["zkSync"] = await import("zksync");
    }
    return internalWalletData["zkSync"];
  },
  get: () => {
    return internalWalletData;
  },
  set: (obj) => {
    if (typeof obj !== "object") {
      return;
    }
    for (const [key, value] of Object.entries(obj)) {
      internalWalletData[key] = value;
    }
  },
};
