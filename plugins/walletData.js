const walletData = {
  syncProvider: null,
  syncWallet: null,
  accountState: null,
};

export default {
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
