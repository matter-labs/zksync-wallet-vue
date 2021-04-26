import { APP_ZKSYNC_API_LINK } from "@/plugins/build";
import { TokenInfo, ZkInTokenPrices } from "@/plugins/types";
import { walletData } from "@/plugins/walletData";
import { actionTree, getterTree, mutationTree } from "typed-vuex";
import { Tokens, TokenSymbol } from "zksync/build/types";

/**
 * Operations with the tokens (assets)
 * @return {{tokenPrices: {}, restrictedTokens: [string, string, string], allTokens: {}}}
 */
export const state = () => ({
  strict: process.env.NODE_ENV !== "production",

  /**
   * Restricted tokens, fee can't be charged in it
   */
  restrictedTokens: <TokenSymbol[]>[],

  /**
   * All available tokens:
   * — decimals
   * — symbol
   * — id
   * — address
   *
   * Addressed by id
   */
  allTokens: <Tokens>{},

  /**
   * Token prices
   */
  tokenPrices: <ZkInTokenPrices>{},
});

export type TokensModuleState = ReturnType<typeof state>;

export const mutations = mutationTree(state, {
  setAllTokens(state, tokenList: Tokens): void {
    state.allTokens = tokenList;
  },
  setTokenPrice(state, { symbol, obj }): void {
    state.tokenPrices[symbol] = obj;
  },
  addRestrictedToken(state, symbol: TokenSymbol): void {
    if (!state.restrictedTokens.includes(symbol) && symbol.toLowerCase() !== "eth") {
      state.restrictedTokens.push(symbol);
    }
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
  getTokenPrices(state): ZkInTokenPrices {
    return state.tokenPrices;
  },
  getTokenByID(state) {
    return (id: number): TokenInfo | undefined => {
      for (const symbol in state.allTokens) {
        if (state.allTokens[symbol].id === id) {
          return state.allTokens[symbol];
        }
      }
    };
  },
});

interface BalanceToReturn {
  address: string;
  balance: string;
  symbol: string;
  id: number;
}

export const actions = actionTree(
  { state, getters, mutations },
  {
    async loadAllTokens({ commit, getters }): Promise<Tokens> {
      if (Object.entries(getters.getAllTokens).length === 0) {
        await this.app.$accessor.wallet.restoreProviderConnection();
        const tokensList: Tokens = await walletData.get().syncProvider!.getTokens();
        await this.app.$accessor.tokens.loadRestrictedTokens(tokensList);
        commit("setAllTokens", tokensList);
        return tokensList || {};
      }
      return getters.getAllTokens;
    },
    async loadRestrictedTokens({ state, commit }, tokensList: Tokens): Promise<TokenSymbol[]> {
      if (state.restrictedTokens.length === 0) {
        const acceptableTokens: TokenInfo[] = (await this.$axios.get(`https://${APP_ZKSYNC_API_LINK}/api/v0.1/tokens_acceptable_for_fees`)).data;
        for (const symbol in tokensList) {
          if ((symbol.toLowerCase() !== "eth" && !acceptableTokens!.some((element: { id: number }) => element.id === tokensList[symbol]!.id)) || tokensList[symbol]!.id === 0) {
            commit("addRestrictedToken", symbol);
          }
        }
      }
      return state.restrictedTokens;
    },

    async loadTokensAndBalances(): Promise<{ zkBalances: BalanceToReturn[]; tokens: Tokens }> {
      const accountState = walletData.get().accountState;

      const tokens: Tokens = await this.app.$accessor.tokens.loadAllTokens();
      const zkBalance = accountState?.committed.balances;
      if (!zkBalance) {
        return {
          tokens,
          zkBalances: <BalanceToReturn[]>[],
        };
      }
      const zkBalances: BalanceToReturn[] = Object.keys(zkBalance).map((key: TokenSymbol) => {
        const syncWallet = walletData.get().syncWallet;
        return {
          address: tokens[key].address,
          balance: syncWallet!.provider.tokenSet.formatToken(tokens[key].symbol, zkBalance[key] ? zkBalance[key].toString() : "0"),
          symbol: tokens[key].symbol,
          id: tokens[key].id,
        } as BalanceToReturn;
      });

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
      await this.app.$accessor.wallet.restoreProviderConnection();
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
