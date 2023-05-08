/* eslint-disable require-await */
import Vue from "vue";
// @ts-ignore
import cache from "js-cache";
import { BigNumber, Contract } from "ethers";
import type { BigNumberish, ContractInterface } from "ethers";
import type { GetterTree, MutationTree, ActionTree } from "vuex";
import { RestProvider, Wallet, RemoteWallet } from "zksync";
import { AccountState as WalletAccountState, Tokens, TokenSymbol } from "zksync/build/types";
import { ERC20_APPROVE_TRESHOLD, IERC20_INTERFACE, getPendingBalance } from "zksync/build/utils";
import { ModuleOptions, ZkInNFT, ZkTokenBalances, ZkEthereumBalances } from "@/types/zksync";

let ethereumBalancePromises: { [symbol: string]: Promise<BigNumber> } = {};
let allowancePromises: { [symbol: string]: Promise<BigNumber> } = {};
let pendingBalancePromises: { [symbol: string]: Promise<BigNumberish> } = {};

const ethereumBalanceCachePrefix = "ethereumBalanceLoaded-";
const allowanceCachePrefix = "allowanceLoaded-";
const pendingBalanceCachePrefix = "allowanceLoaded-";

export type BalancesState = {
  ethereumBalances: ZkEthereumBalances;
  ethereumBalanceLoadingAll: boolean;
  ethereumBalanceLoading: { [symbol: string]: boolean };
  ethereumBalancesRequested: boolean;
  tokensAllowance: { [symbol: string]: BigNumber };
  tokensAllowanceLoading: { [symbol: string]: boolean };
  tokensAllowanceForceUpdate: number;
  pendingBalance: { [symbol: string]: BigNumber };
  pendingBalanceLoading: { [symbol: string]: boolean };
};

export const state = (_: ModuleOptions): BalancesState => ({
  ethereumBalances: {},
  ethereumBalanceLoadingAll: false,
  ethereumBalanceLoading: {},
  ethereumBalancesRequested: false,
  tokensAllowance: {
    ETH: ERC20_APPROVE_TRESHOLD,
  },
  tokensAllowanceLoading: {},
  tokensAllowanceForceUpdate: Number.MIN_SAFE_INTEGER,
  pendingBalance: {},
  pendingBalanceLoading: {},
});

export const getters: GetterTree<BalancesState, BalancesState> = {
  ethereumBalances: (state) => state.ethereumBalances,
  ethereumBalance: (state) => (symbol: TokenSymbol) => state.ethereumBalances[symbol],
  ethereumBalanceLoadingAll: (state) => state.ethereumBalanceLoadingAll,
  ethereumBalanceLoading: (state) => state.ethereumBalanceLoading,
  ethereumBalancesRequested: (state) => state.ethereumBalancesRequested,
  tokensAllowance: (state) => state.tokensAllowance,
  tokenAllowance: (state) => (symbol: TokenSymbol) => state.tokensAllowance[symbol],
  tokensAllowanceLoading: (state) => state.tokensAllowanceLoading,
  tokensAllowanceForceUpdate: (state) => state.tokensAllowanceForceUpdate,
  pendingBalances: (state) => state.pendingBalance,
  pendingBalance: (state) => (symbol: TokenSymbol) => state.pendingBalance[symbol],
  pendingBalancesLoading: (state) => state.pendingBalanceLoading,
  pendingBalanceLoading: (state) => (symbol: TokenSymbol) => state.pendingBalance[symbol],
  balances: (_, __, ___, rootGetters) => {
    if (!rootGetters["zk-account/accountState"]) {
      return {};
    }
    const accountState: WalletAccountState = rootGetters["zk-account/accountState"];
    const balances: ZkTokenBalances = {};
    const tokens = rootGetters["zk-tokens/zkTokens"];
    for (const symbol in accountState.committed.balances) {
      const committedTokenBalance = accountState.committed.balances[symbol];
      const feeAvailable = tokens[symbol] ? tokens[symbol].enabledForFees : false;
      if (committedTokenBalance.toString() === "0") {
        continue;
      }
      if (committedTokenBalance.toString() !== accountState.verified.balances[symbol]?.toString()) {
        balances[symbol] = {
          balance: committedTokenBalance,
          verified: false,
          feeAvailable,
        };
      } else {
        balances[symbol] = {
          balance: committedTokenBalance,
          verified: true,
          feeAvailable,
        };
      }
    }
    return balances;
  },
  depositingBalances: (_, __, ___, rootGetters) => {
    const accountState: WalletAccountState = rootGetters["zk-account/accountState"];
    if (!accountState) {
      return {};
    }
    return accountState.depositing.balances;
  },
  nfts: (_, __, ___, rootGetters) => {
    const accountState: WalletAccountState = rootGetters["zk-account/accountState"];
    if (!accountState) {
      return {};
    }
    const nfts: { [tokenId: number]: ZkInNFT } = {};
    for (const tokenId in accountState.committed.nfts) {
      nfts[tokenId] = {
        ...accountState.committed.nfts[tokenId],
        verified: Object.prototype.hasOwnProperty.call(accountState.verified.nfts, tokenId),
      };
    }
    return nfts;
  },
  mintedNFTs: (_, __, ___, rootGetters) => {
    const accountState: WalletAccountState = rootGetters["zk-account/accountState"];
    if (!accountState) {
      return {};
    }
    const nfts: { [tokenId: number]: ZkInNFT } = {};
    for (const tokenId in accountState.committed.mintedNfts) {
      nfts[tokenId] = {
        ...accountState.committed.nfts[tokenId],
        verified: Object.prototype.hasOwnProperty.call(accountState.verified.mintedNfts, tokenId),
      };
    }
    return nfts;
  },
};

export const mutations: MutationTree<BalancesState> = {
  setEthereumBalance: (state, { symbol, balance }: { symbol: TokenSymbol; balance: BigNumber }) => Vue.set(state.ethereumBalances, symbol, balance),
  setEthereumBalanceLoadingAll: (state, status: boolean) => (state.ethereumBalanceLoadingAll = status),
  setEthereumBalanceLoading: (state, { symbol, status }: { symbol: TokenSymbol; status: boolean }) => Vue.set(state.ethereumBalanceLoading, symbol, status),
  setEthereumBalancesRequested: (state, status: boolean) => (state.ethereumBalancesRequested = status),
  removeEthereumBalance: (state, symbol: TokenSymbol) => delete state.ethereumBalances[symbol],
  setAllowance: (state, { symbol, amount }: { symbol: TokenSymbol; amount: BigNumber }) => Vue.set(state.tokensAllowance, symbol, amount),
  setAllowanceLoading: (state, { symbol, status }: { symbol: TokenSymbol; status: boolean }) => Vue.set(state.tokensAllowanceLoading, symbol, status),
  removeAllowance: (state, symbol: TokenSymbol) => delete state.tokensAllowance[symbol],
  tokensAllowanceForceUpdate: (state) => state.tokensAllowanceForceUpdate++,
  setPendingBalance: (state, { symbol, amount }: { symbol: TokenSymbol; amount: BigNumber }) => Vue.set(state.pendingBalance, symbol, amount),
  removePendingBalance: (state, symbol: TokenSymbol) => delete state.pendingBalance[symbol],
  setPendingBalanceLoading: (state, { symbol, status }: { symbol: TokenSymbol; status: boolean }) => Vue.set(state.pendingBalanceLoading, symbol, status),
  clear: (state) => {
    for (const key of cache.keys()) {
      /* Remove saved cache ethereum balances data */
      if (typeof key === "string" && (key.includes(ethereumBalanceCachePrefix) || key.includes(allowanceCachePrefix) || key.includes(pendingBalanceCachePrefix))) {
        cache.del(key);
      }
    }
    state.ethereumBalances = {};
    state.ethereumBalanceLoading = {};
    state.ethereumBalancesRequested = false;
    state.tokensAllowance = {
      ETH: ERC20_APPROVE_TRESHOLD,
    };
    state.tokensAllowanceLoading = {};
    state.pendingBalance = {};
    state.pendingBalanceLoading = {};
    ethereumBalancePromises = {};
    allowancePromises = {};
    pendingBalancePromises = {};
  },
};

export const actions: ActionTree<BalancesState, BalancesState> = {
  async requestEthereumBalance({ commit, rootGetters, getters }, { force = false, symbol }: { force?: boolean; symbol: TokenSymbol }): Promise<BigNumber> {
    if (!rootGetters["zk-account/loggedIn"]) return BigNumber.from("0");
    const tokenCacheKey = `${ethereumBalanceCachePrefix}${symbol}`;
    if (cache.get(tokenCacheKey) && !force) {
      return getters.ethereumBalance(symbol);
    }
    const syncWallet: Wallet | RemoteWallet = rootGetters["zk-wallet/syncWallet"];
    commit("setEthereumBalanceLoading", { symbol, status: true });
    try {
      if (!ethereumBalancePromises[symbol] || force) {
        ethereumBalancePromises[symbol] = syncWallet.getEthereumBalance(symbol);
      }
      const balance = await ethereumBalancePromises[symbol];
      if (balance.eq("0")) {
        commit("removeEthereumBalance", symbol);
      } else {
        commit("setEthereumBalance", { symbol, balance: balance.toString() });
      }
    } catch (error) {
      console.warn(`Can't get L1 balance of ${symbol}`, error);
      commit("removeEthereumBalance", symbol);
    }
    commit("setEthereumBalanceLoading", { symbol, status: false });
    cache.set(tokenCacheKey, true, 15000);
    delete ethereumBalancePromises[symbol];
    return getters.ethereumBalance(symbol);
  },
  async requestEthereumBalances({ commit, dispatch, rootGetters, getters }, force = false) {
    if (!rootGetters["zk-account/loggedIn"]) return {};
    commit("setEthereumBalanceLoadingAll", true);
    const tokens: Tokens = await dispatch("zk-tokens/loadZkTokens", null, { root: true });
    const balancesPromises = Object.keys(tokens).map((symbol) => dispatch("requestEthereumBalance", { force, symbol }));
    await Promise.all(balancesPromises).catch((error) => {
      console.warn("Error requesting ethereum balances\n", error);
    });
    commit("setEthereumBalanceLoadingAll", false);
    commit("setEthereumBalancesRequested", true);
    return getters.ethereumBalances;
  },
  async requestAllowance({ commit, rootGetters, getters }, { force = false, symbol }: { force?: boolean; symbol: TokenSymbol }): Promise<BigNumber> {
    if (!rootGetters["zk-account/loggedIn"]) return BigNumber.from("0");
    if (symbol === "ETH") {
      return ERC20_APPROVE_TRESHOLD;
    }
    const allowanceCacheKey = `${allowanceCachePrefix}${symbol}`;
    if (cache.get(allowanceCacheKey) && !force) {
      return getters.tokenAllowance(symbol);
    }
    const syncWallet: Wallet | RemoteWallet = rootGetters["zk-wallet/syncWallet"];
    commit("setAllowanceLoading", { symbol, status: true });
    commit("tokensAllowanceForceUpdate");
    try {
      if (!allowancePromises[symbol]) {
        const tokenAddress = syncWallet.provider.tokenSet.resolveTokenAddress(symbol);
        const erc20contract = new Contract(tokenAddress, IERC20_INTERFACE as ContractInterface, syncWallet.ethSigner());
        allowancePromises[symbol] = erc20contract.allowance(rootGetters["zk-account/address"], syncWallet.provider.contractAddress.mainContract);
      }
      const allowance = await allowancePromises[symbol];
      commit("setAllowance", { symbol, amount: allowance });
    } catch (error) {
      console.warn(`Can't get allowance of ${symbol}\n`, error);
      commit("removeAllowance", symbol);
    }
    commit("setAllowanceLoading", { symbol, status: false });
    commit("tokensAllowanceForceUpdate");
    cache.set(allowanceCacheKey, true, 15000);
    delete allowancePromises[symbol];
    return getters.tokenAllowance(symbol);
  },
  async requestPendingBalance({ commit, dispatch, rootGetters, getters }, { force = false, symbol }: { force?: boolean; symbol: TokenSymbol }): Promise<BigNumberish> {
    if (!rootGetters["zk-account/loggedIn"]) return BigNumber.from("0");
    const pendingBalanceCacheKey = `${pendingBalanceCachePrefix}${symbol}`;
    if (cache.get(pendingBalanceCacheKey) && !force) {
      return getters.pendingBalance(symbol);
    }
    commit("setPendingBalanceLoading", { symbol, status: true });
    try {
      if (!pendingBalancePromises[symbol]) {
        const syncProvider: RestProvider = await dispatch("zk-provider/requestProvider", null, { root: true });
        const ethProvider = rootGetters["zk-onboard/web3Provider"];
        pendingBalancePromises[symbol] = getPendingBalance(ethProvider, syncProvider, rootGetters["zk-account/address"], symbol);
      }
      const pendingBalance = await pendingBalancePromises[symbol];
      commit("setPendingBalance", { symbol, amount: pendingBalance });
    } catch (error) {
      console.warn(`Can't get pending balance of ${symbol} for ${rootGetters["zk-account/address"]}\n`, error);
      commit("removePendingBalance", symbol);
    }
    commit("setPendingBalanceLoading", { symbol, status: false });
    cache.set(pendingBalanceCacheKey, true, 15000);
    delete pendingBalancePromises[symbol];
    return getters.pendingBalance(symbol);
  },
};

export default () => ({
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
});
