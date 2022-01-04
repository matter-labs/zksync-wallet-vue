import Vue from "vue";
import { actionTree, getAccessorType, getterTree, mutationTree } from "typed-vuex";
import { Tokens, TokenSymbol } from "zksync/build/types";
import ERC20ABI from "zksync/abi/IERC20.json";
import { BigNumberish, Contract } from "ethers";
import { Wallet } from "zksync";
import { ZkFeeState } from "@/types/lib";

let withdrawFeePromise: {
  [symbol: string]: Promise<BigNumberish>;
} = {};

export const state = (): ZkFeeState => ({
  withdrawFees: {},
  withdrawFeesLoading: {},
});

export const getters = getterTree(state, {
  getWithdrawFees: (state: ZkFeeState) => state.withdrawFees,
  getWithdrawFee: (state: ZkFeeState) => (symbol: TokenSymbol) => state.withdrawFees[symbol],
  getWithdrawFeesLoading: (state: ZkFeeState) => state.withdrawFeesLoading,
  getWithdrawFeeLoading: (state: ZkFeeState) => (symbol: TokenSymbol) => state.withdrawFeesLoading[symbol],
});

export const mutations = mutationTree(state, {
  setWithdrawFee(state: ZkFeeState, { symbol, fee }: { symbol: TokenSymbol; fee: BigNumberish }): void {
    Vue.set(state.withdrawFees, symbol, fee);
  },
  setWithdrawFeeLoading(state: ZkFeeState, { symbol, status }: { symbol: TokenSymbol; status: boolean }): void {
    Vue.set(state.withdrawFeesLoading, symbol, status);
  },
  clear(state: ZkFeeState) {
    Vue.set(state, "withdrawFees", {});
    Vue.set(state, "withdrawFeesLoading", {});
    withdrawFeePromise = {};
  },
});

export const actions = actionTree(
  { state, getters, mutations },
  {
    async requestWithdrawFee({ commit, getters, rootGetters }, { symbol, force }: { symbol: TokenSymbol; force: boolean }): Promise<void> {
      if (symbol === "ETH") {
        return;
      }
      if (getters.getWithdrawFee(symbol) && !force) {
        return;
      }
      commit("setWithdrawFeeLoading", { symbol, status: true });
      try {
        const tokens: Tokens = rootGetters["zk-tokens/zkTokens"];
        const syncWallet: Wallet = rootGetters["zk-wallet/syncWallet"];
        const contract = new Contract(tokens[symbol].address, ERC20ABI.abi, syncWallet.ethSigner);
        if (!withdrawFeePromise[symbol] || force) {
          withdrawFeePromise[symbol] = contract.estimateGas.transferFrom(tokens[symbol].address, rootGetters["zk-account/address"], "0");
        }
        const fee: BigNumberish = await withdrawFeePromise[symbol];
        commit("setWithdrawFee", {
          symbol,
          fee,
        });
      } catch (error) {
        console.warn(`Error requesting withdraw fee for ${symbol}\n`, error);
      } finally {
        delete withdrawFeePromise[symbol];
        commit("setWithdrawFeeLoading", { symbol, status: false });
      }
    },
  },
);

export const accessorType = getAccessorType({
  state,
  getters,
  mutations,
  actions,
  modules: {},
});
