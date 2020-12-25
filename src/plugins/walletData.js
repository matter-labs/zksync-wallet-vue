/**
 * Wrapper for the major Providers
 * @type {{accountState: null, syncProvider: null, syncWallet: null, zkSync: any|null}}
 */
const walletData = {
  syncProvider: null,
  syncWallet: null,
  accountState: null,
  zkSync: null,
};

export default {
  /*
   * @return {Promise<{ Wallet, Signer, Provider, ETHProxy, closestPackableTransactionFee, closestPackableTransactionAmount, getDefaultProvider, types, utils, crypto, wallet }|null>}
   */
  zkSync: async () => {
    if (!process.client) {
      return null;
    }
    if (!walletData["zkSync"]) {
      walletData["zkSync"] = await import("zksync");
    }
    return walletData["zkSync"];
  },
  get: () => {
    return walletData;
  },
  set: (obj) => {
    if (typeof obj !== "object") {
      return;
    }
    for (const [key, value] of Object.entries(obj)) {
      walletData[key] = value;
    }
  },
};
