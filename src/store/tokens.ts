/* eslint-disable require-await */
// @ts-ignore
import cache from "js-cache";
// eslint-disable-next-line import/named
import { GetterTree, MutationTree, ActionTree } from "vuex";
import { RestProvider } from "zksync";
import { NFTInfo, Tokens, TokenSymbol } from "zksync/build/types";
import { ModuleOptions, ZkTokenPrices } from "@/types/zksync";

let zkTokensPromise: Promise<Tokens>;
/* let feeAcceptableTokensPromise: Promise<{ data: Token[] }>; */
const tokenPricesPromise: {
  [token: string]: Promise<number>;
} = {};

export type TokensState = {
  zkTokens?: Tokens;
  zkTokensLoading: boolean;
  tokenPrices: ZkTokenPrices;
  forceUpdateVal: number;
};

export const state = (_: ModuleOptions): TokensState => ({
  zkTokens: undefined,
  zkTokensLoading: false,
  tokenPrices: {},
  forceUpdateVal: Number.MIN_SAFE_INTEGER,
});

export const getters: GetterTree<TokensState, TokensState> = {
  zkTokens: (state) => state.zkTokens,
  zkTokensLoading: (state) => state.zkTokensLoading,
  zkTokenByID: (state) => (id: number) => {
    if (!state.zkTokens) {
      return;
    }
    for (const symbol in state.zkTokens) {
      if (state.zkTokens[symbol].id === id) {
        return state.zkTokens[symbol];
      }
    }
  },
  tokenPrices: (state) => state.tokenPrices,
  forceUpdateVal: (state) => state.forceUpdateVal,
};

export const mutations: MutationTree<TokensState> = {
  setZkTokens: (state, tokens: Tokens) => (state.zkTokens = tokens),
  setZkTokensLoading: (state, status: boolean) => (state.zkTokensLoading = status),
  setTokenPrice: (state, { tokenSymbol, price }: { tokenSymbol: TokenSymbol; price: number }) => (state.tokenPrices[tokenSymbol] = price),
  forceUpdate: (state) => state.forceUpdateVal++,
  clear: (state) => {
    state.zkTokens = undefined;
    state.tokenPrices = {};
  },
};

export const actions: ActionTree<TokensState, TokensState> = {
  async loadZkTokens({ commit, getters, dispatch }, force = false) {
    commit("setZkTokensLoading", true);
    try {
      if (!zkTokensPromise || force) {
        zkTokensPromise = ((await dispatch("zk-provider/requestProvider", null, { root: true })) as RestProvider).getTokens();
      }
      const tokens = await zkTokensPromise;
      commit("setZkTokens", tokens);
    } catch (error) {
      console.warn("Error loading zkSync tokens\n", error);
    }
    commit("setZkTokensLoading", false);
    return getters.zkTokens;
  },
  async getTokenPrice({ getters, commit, dispatch }, symbol: TokenSymbol): Promise<number> {
    try {
      if (!Object.prototype.hasOwnProperty.call(getters.tokenPrices, symbol)) {
        if (!tokenPricesPromise[symbol]) {
          const provider = (await dispatch("zk-provider/requestProvider", null, { root: true })) as RestProvider;
          tokenPricesPromise[symbol] = provider.getTokenPrice(symbol);
        }
        const tokenPrice = await tokenPricesPromise[symbol];
        commit("setTokenPrice", { tokenSymbol: symbol, price: tokenPrice });
        commit("forceUpdate");
        cache.set(`tokenPrice-${symbol}`, tokenPrice, 3600000);
        delete tokenPricesPromise[symbol];
        return tokenPrice;
      }
      /*
        If data in cache is outdated then return last saved token price (saved in vuex) to provide faster response
        and create new thread that will overwrite vuex value after the promise has been fulfilled.
        When the token price will be overwritten in vuex, price in the computed property should be reactively updated
      */
      if (!cache.get(`tokenPrice-${symbol}`)) {
        if (!tokenPricesPromise[symbol]) {
          const provider = (await dispatch("zk-provider/requestProvider", null, { root: true })) as RestProvider;
          tokenPricesPromise[symbol] = provider.getTokenPrice(symbol);
          tokenPricesPromise[symbol].then((tokenPrice) => {
            commit("setTokenPrice", { tokenSymbol: symbol, price: tokenPrice });
            commit("forceUpdate");
            cache.set(`tokenPrice-${symbol}`, tokenPrice, 3600000);
            delete tokenPricesPromise[symbol];
          });
        }
        return getters.tokenPrices[symbol];
      }
    } catch (error) {
      delete tokenPricesPromise[symbol];
      console.warn(`Error getting token price for ${symbol}\n`, error);
    }
    return 0;
  },
  async isTokenFeeAcceptable({ getters, dispatch }, symbol: TokenSymbol) {
    if (!getters.zkTokens || getters.zkTokensLoading) {
      await dispatch("loadZkTokens");
    }
    if (symbol === "ETH") {
      return true;
    }
    const tokens = getters.zkTokens;
    return Object.prototype.hasOwnProperty.call(tokens, symbol) ? tokens[symbol].enabledForFees : false;
  },
  async getNFT({ dispatch }, tokenID: number): Promise<false | NFTInfo> {
    try {
      const syncProvider: RestProvider = await dispatch("zk-provider/requestProvider", null, { root: true });
      return await syncProvider.getNFT(tokenID);
    } catch (error) {
      if (error && (error as Error).message && !(error as Error).message.includes("operation is not verified yet")) {
        console.warn(`Error loading NFT token with ID ${tokenID}\n`, error);
      }
      return false;
    }
  },
};

export default () => ({
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
});
