import { walletData } from "@/plugins/walletData";
import { BigNumberish } from "ethers";
import { TokenSymbol } from "zksync/build/types";
import { actionTree, getterTree, mutationTree } from "typed-vuex";
import { BalanceToReturn, TokenInfo, Tokens, ZkInTokenPrices } from "~/types/lib";
import { ZK_API_BASE } from "~/plugins/build";

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

  acceptableTokens: <TokenInfo[]>[],

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
  tokenPricesTick: 0, // Used to force update component's
});

export type TokensModuleState = ReturnType<typeof state>;

export const mutations = mutationTree(state, {
  setAllTokens(state: TokensModuleState, tokenList: Tokens): void {
    state.allTokens = tokenList;
  },
  setTokenPrice(state: TokensModuleState, { symbol, obj }: { symbol: TokenSymbol; obj: { lastUpdated?: number; price: number } }): void {
    // @ts-ignore
    state.tokenPrices[symbol] = obj;
    state.tokenPricesTick++;
  },
  storeAcceptableTokens(state: TokensModuleState, tokenList: TokenInfo[]): void {
    state.acceptableTokens = tokenList;
  },
  addRestrictedToken(state: TokensModuleState, token: TokenSymbol): void {
    if (!state.restrictedTokens.includes(token) && token.toLowerCase() !== "eth") {
      state.restrictedTokens.push(token);
    }
  },
});

export const getters = getterTree(state, {
  getAllTokens(state: TokensModuleState): Tokens {
    return state.allTokens;
  },
  getRestrictedTokens(state: TokensModuleState): TokenSymbol[] {
    return state.restrictedTokens;
  },
  getAvailableTokens(state: TokensModuleState): Tokens {
    return Object.fromEntries(Object.entries(state.allTokens).filter((e) => !state.restrictedTokens.includes(e[1].symbol)));
  },
  getTokenPrices(state: TokensModuleState): ZkInTokenPrices {
    return state.tokenPrices;
  },
  getTokenPriceTick(state: TokensModuleState): number {
    return state.tokenPricesTick;
  },
  getTokenByID(state: TokensModuleState) {
    return (id: number): TokenInfo | undefined => {
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
        /* By taking token list from syncProvider we avoid double getTokens request,
          but the tokensBySymbol param is private on zksync utils types */
        const tokensList: Tokens = await walletData.get().syncProvider!.getTokens();
        commit("setAllTokens", tokensList);
        // Added async loading of the restricted tokens
        await this.app.$accessor.tokens.loadAcceptableTokens();
        return tokensList || {};
      }
      return getters.getAllTokens;
    },
    async loadAcceptableTokens({ commit }): Promise<void> {
      const acceptableTokens: TokenInfo[] = await this.app.$http.$get(`https://${ZK_API_BASE}/api/v0.1/tokens_acceptable_for_fees`);
      commit("storeAcceptableTokens", acceptableTokens);
    },

    async loadTokensAndBalances(): Promise<{ zkBalances: BalanceToReturn[]; tokens: Tokens }> {
      const tokens: Tokens = await this.app.$accessor.tokens.loadAllTokens();
      const zkBalance: { [p: string]: BigNumberish } | undefined = walletData.get().accountState?.committed.balances;
      if (!zkBalance) {
        return {
          tokens,
          zkBalances: <BalanceToReturn[]>[],
        };
      }
      const zkBalances: BalanceToReturn[] = Object.keys(zkBalance).map((key: TokenSymbol) => {
        return {
          address: tokens[key].address,
          balance: walletData.get().syncWallet!.provider.tokenSet.formatToken(tokens[key].symbol, zkBalance[key] ? zkBalance[key].toString() : "0"),
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
      const syncProvider = walletData.get().syncProvider;
      const tokenPrice = await syncProvider?.getTokenPrice(symbol);
      // @ts-ignore
      commit("setTokenPrice", {
        symbol,
        obj: {
          lastUpdated: new Date().getTime(),
          price: tokenPrice,
        },
      });
      return tokenPrice || 0;
    },

    isRestricted({ state }, token: TokenSymbol): boolean {
      if (token.toLowerCase() === "eth") {
        return false;
      }
      for (const tokenData of state.acceptableTokens) {
        if (tokenData.symbol.toLowerCase() === token.toLowerCase()) {
          return false;
        }
      }
      return true;
    },
  },
);
