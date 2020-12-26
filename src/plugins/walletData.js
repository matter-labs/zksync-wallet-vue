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

/**
 * @todo avoid cross-colling
 * @param dispatch
 * @param context
 * @return {function(): Promise<void>}
 */
export const changeNetworkHandle = (dispatch, context) => {
  return async () => {
    if (!walletData.get().syncWallet) {
      return;
    }
    dispatch("toaster/info", `Your wallet changed Ethereum network to: ${context}. Reloading wallet...`, { root: true });
    const refreshWalletResult = await dispatch("walletRefresh", false);
    if (refreshWalletResult === false) {
      await context.$router.push("/");
      await dispatch("logout");
    } else {
      await dispatch("forceRefreshData");
    }
  };
};

/**
 * @todo avoid cross-colling
 * @param dispatch
 * @param context
 * @return {function(): Promise<void>}
 */
export const changeAccountHandle = (dispatch, context) => {
  return async () => {
    if (!walletData.get().syncWallet) {
      return;
    }
    dispatch("toaster/message", "Active account changed. Login out...", { root: true });
    await dispatch("logout");
    await context.$router.push("/");
    await dispatch("clearDataStorage");
    await dispatch("account/clearDataStorage", null, { root: true });
  };
};

/**
 * @todo Optimize sorting
 *
 * @param a
 * @param b
 * @return {number}
 */
export const sortBalancesById = (a, b) => {
  if (a.id < b.id) {
    return -1;
  }
  if (a.id > b.id) {
    return 1;
  }
  return 0;
};

export const walletData = {
  /*
   * @return {Promise<{ Wallet, Signer, Provider, ETHProxy, closestPackableTransactionFee, closestPackableTransactionAmount, getDefaultProvider, types, utils, crypto, wallet }|null>}
   */
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
