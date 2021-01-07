import { walletData } from "@/plugins/walletData.js";

/**
 * Operations with the tokens (assets)
 * @return {{tokenPrices: {}, restrictedTokens: [string, string, string], allTokens: {}}}
 */
export const state = () => ({
  /**
   * Restricted tokens, fee can't be charged in it
   */
  restrictedTokens: ["PHNX", "LAMB", "MLTT"],

  /**
   * All available tokens:
   * — decimals
   * — symbol
   * — id
   * — address
   *
   * Addressed by id
   */
  allTokens: {},

  /**
   * Token prices
   */
  tokenPrices: {},
});

export const mutations = {
  setAllTokens(state, tokenList) {
    state.allTokens = tokenList;
  },
  setTokenPrice(state, { symbol, obj }) {
    state.tokenPrices[symbol] = obj;
  },
};

export const getters = {
  getAllTokens(state) {
    return state.allTokens;
  },
  getRestrictedTokens(state) {
    return Object.fromEntries(Object.entries(state.allTokens).filter((e) => state.restrictedTokens.includes(e[1].symbol)));
  },
  getAvailableTokens(state) {
    return Object.fromEntries(Object.entries(state.allTokens).filter((e) => !state.restrictedTokens.includes(e[1].symbol)));
  },
  getTokenPrices(state) {
    return state.tokenPrices;
  },
};

export const actions = {
  /**
   * Get token decimals
   * @param dispatch
   * @param symbol
   * @return {number}
   */
  getTokenDecimals({ dispatch }, symbol) {
    const tokensList = dispatch("loadAllTokens");
    if (tokensList[symbol]) {
      return tokensList[symbol].decimals;
    }
    //@todo: handle error?
  },

  async loadAllTokens({ commit, getters }) {
    if (Object.entries(getters["getAllTokens"]).length === 0) {
      await this.dispatch("wallet/restoreProviderConnection");
      let syncProvider = walletData.get().syncProvider;
      const tokensList = await syncProvider.getTokens();
      commit("setAllTokens", tokensList);
      return tokensList;
    }
    return getters["getAllTokens"];
  },

  async loadTokensAndBalances({ dispatch }) {
    let syncWallet = walletData.get().syncWallet;
    let accountState = walletData.get().accountState;

    const tokens = await dispatch("loadAllTokens");
    const zkBalance = accountState.committed.balances;
    const zkBalances = Object.keys(zkBalance).map((key) => ({
      address: tokens[key].address,
      balance: syncWallet.provider.tokenSet.formatToken(tokens[key].symbol, zkBalance[key] ? zkBalance[key].toString() : "0"),
      symbol: tokens[key].symbol,
      id: tokens[key].id,
    }));

    return {
      tokens,
      zkBalances,
    };
  },

  /**
   *
   * @param commit
   * @param getters
   * @param commit
   * @param getters
   * @param symbol
   * @return {Promise<{n: number, d: number}|number|*>}
   */
  async getTokenPrice({ commit, getters }, symbol) {
    const localPricesList = getters["getTokenPrices"];
    if (localPricesList.hasOwnProperty(symbol) && localPricesList[symbol].lastUpdated > new Date().getTime() - 3600000) {
      return localPricesList[symbol].price;
    }
    await this.dispatch("wallet/restoreProviderConnection");
    let syncProvider = walletData.get().syncProvider;
    const tokenPrice = await syncProvider.getTokenPrice(symbol);
    commit("setTokenPrice", {
      symbol: symbol,
      obj: {
        lastUpdated: new Date().getTime(),
        price: tokenPrice,
      },
    });
    return tokenPrice;
  },
};
