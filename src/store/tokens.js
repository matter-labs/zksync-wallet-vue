import walletData from "@/plugins/walletData.js";
import handleFormatToken from "@/plugins/handleFormatToken.js";


/**
 * Operations with the tokens (assets)
 * @return {{restrictedTokens: [string, string], allTokens: []}}
 */
export const state = () => ({
  /**
   * Restricted tokens, fee can't be charged in it
   */
  restrictedTokens: ["PHNX","LAMB"],

  /**
   * All available tokens
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
    return Object.fromEntries(Object.entries(state.allTokens).filter(e=>state.restrictedTokens.includes(e[1].symbol)));
  },
  getAvailableTokens(state) {
    return Object.fromEntries(Object.entries(state.allTokens).filter(e=>!state.restrictedTokens.includes(e[1].symbol)));
  },
  getTokenPrices(state) {
    return state.tokenPrices;
  },
};

export const actions = {
  async loadAllTokens({commit,getters}) {
    if(Object.entries(getters['getAllTokens']).length===0) {
      await this.dispatch('wallet/restoreProviderConnection');
      let syncProvider = walletData.get().syncProvider;
      const tokensList = await syncProvider.getTokens();
      commit('setAllTokens', tokensList);
      return tokensList;
    }
    else {
      return getters['getAllTokens'];
    }
  },
  async loadTokensAndBalances({dispatch}) {
    let syncWallet = walletData.get().syncWallet;
    let accountState = walletData.get().accountState;

    const tokens = await dispatch('loadAllTokens');
    const zkBalance = accountState.committed.balances;
    const balancePromises = Object.entries(tokens)
      .filter((t) => t[1].symbol)
      .map(async ([key, value]) => {
        return {
          id: value.id,
          address: value.address,
          balance: +syncWallet.provider.tokenSet.formatToken(value.symbol, zkBalance[key] ? zkBalance[key].toString() : "0"),
          symbol: value.symbol,
        };
      });

    const ethBalances = await Promise.all(balancePromises)
      .then((res) => {
        return res.filter((token) => token);
      })
      .catch((err) => {return []});

    const zkBalancePromises = Object.keys(zkBalance).map(async (key) => ({
      address: tokens[key].address,
      balance: +syncWallet.provider.tokenSet.formatToken(tokens[key].symbol, zkBalance[key] ? zkBalance[key].toString() : "0"),
      symbol: tokens[key].symbol,
      id: tokens[key].id,
    }));

    const zkBalances = await Promise.all(zkBalancePromises).catch((err) => {return []});
    
    return {
      tokens,
      zkBalances,
      ethBalances
    };
  },

  /**
   *
   * @param symbol
   * @return {Promise<{n: number, d: number}|number|*>}
   */
  async getTokenPrice({ commit, getters }, symbol) {
    const localPricesList = getters["getTokenPrices"];
    if (localPricesList.hasOwnProperty(symbol) && localPricesList[symbol].lastUpdated > new Date().getTime() - 3600000) {
      return localPricesList[symbol].price;
    }
    await this.dispatch('wallet/restoreProviderConnection');
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
