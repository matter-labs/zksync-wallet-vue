import { BigNumberish } from "ethers";
import { actionTree, getterTree, mutationTree } from "typed-vuex";
import { TokenItem, TokenPrices, Tokens } from "@/plugins/types";
import { Address, TokenSymbol } from "zksync/build/types";
import { walletData } from "~/plugins/walletData";

/**
 * Operations with the tokens (assets)
 * @return {{tokenPrices: {}, restrictedTokens: [string, string, string], allTokens: {}}}
 */
export const state = () => ({
  strict: process.env.NODE_ENV !== "production",

  /**
   * Restricted tokens, fee can't be charged in it
   */
  restrictedTokens: ["PHNX", "LAMB", "MLTT"] as Array<TokenSymbol>,

  /**
   * All available tokens:
   * — decimals
   * — symbol
   * — id
   * — address
   *
   * Addressed by id
   */
  allTokens: {} as Tokens,

  /**
   * Token prices
   */
  tokenPrices: {} as TokenPrices,
});

export type TokensModuleState = ReturnType<typeof state>;

export const mutations = mutationTree(state, {
  setAllTokens(state, tokenList: Tokens): void {
    state.allTokens = tokenList;
  },
  setTokenPrice(state, { symbol, obj }): void {
    state.tokenPrices[symbol] = obj;
  },
});

export const getters = getterTree(state, {
  getAllTokens(state): Tokens {
    return state.allTokens;
  },
  getRestrictedTokens(state): Tokens {
    return Object.fromEntries(Object.entries(state.allTokens).filter((e) => state.restrictedTokens.includes(e[1].symbol)));
  },
  getAvailableTokens(state): Tokens {
    return Object.fromEntries(Object.entries(state.allTokens).filter((e) => !state.restrictedTokens.includes(e[1].symbol)));
  },
  getTokenPrices(state): TokenPrices {
    return state.tokenPrices;
  },
  getTokenByID(state) {
    return (id: number): TokenItem | undefined => {
      for (const symbol in state.allTokens) {
        if (state.allTokens[symbol].id === id) {
          return state.allTokens[symbol];
        }
      }
    };
  },
});

export const actions = actionTree(
  { state, getters, mutations },
  {
    async loadAllTokens({ commit, getters }): Promise<Tokens> {
      if (Object.entries(getters.getAllTokens).length === 0) {
        await this.dispatch("wallet/restoreProviderConnection");
        const tokensList = await walletData.get().syncProvider?.getTokens();
        commit("setAllTokens", tokensList as Tokens);
        return tokensList || {};
      }
      return getters.getAllTokens;
    },

    async loadTokensAndBalances({
      dispatch,
    }): Promise<{
      tokens: Tokens;
      zkBalances: Array<TokenSymbol>;
    }> {
      const syncWallet = walletData.get().syncWallet;
      const accountState = walletData.get().accountState;

      const tokens = await dispatch("loadAllTokens");
      const zkBalance = accountState?.committed.balances;
      if (!zkBalance) {
        return {
          tokens,
          zkBalances: [],
        };
      }
      const zkBalances = Object.keys(
        zkBalance as {
          [token: string]: BigNumberish;
        },
      ).map((key: TokenSymbol) => ({
        address: tokens[key].address as Address,
        balance: syncWallet?.provider.tokenSet.formatToken(tokens[key].symbol, zkBalance[key] ? zkBalance[key].toString() : "0") as string,
        symbol: tokens[key].symbol as TokenSymbol,
        id: tokens[key].id as number,
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
    async getTokenPrice({ commit, getters }, symbol: TokenSymbol): Promise<number> {
      const localPricesList = getters.getTokenPrices;
      if (Object.prototype.hasOwnProperty.call(localPricesList, symbol) && localPricesList[symbol].lastUpdated > new Date().getTime() - 3600000) {
        return localPricesList[symbol].price;
      }
      await this.dispatch("wallet/restoreProviderConnection");
      const syncProvider = walletData.get().syncProvider;
      const tokenPrice = await syncProvider?.getTokenPrice(symbol);
      commit("setTokenPrice", {
        symbol,
        obj: {
          lastUpdated: new Date().getTime(),
          price: tokenPrice,
        },
      });
      return tokenPrice || 0;
    },
  },
);
