/* eslint-disable require-await */
// @ts-ignore
import cache from "js-cache";
import { BigNumber } from "ethers";
import type { GetterTree, MutationTree, ActionTree } from "vuex";
import { closestPackableTransactionFee, RestProvider } from "zksync";
import { TokenSymbol } from "zksync/build/types";
import { ModuleOptions, ZkFeeParams, ZkFeeTransactionParams, ZkTransferBatchItem } from "@/types/zksync";

export type FeesState = {};

export const state = (_: ModuleOptions): FeesState => ({});

export const getters: GetterTree<FeesState, FeesState> = {};

export const mutations: MutationTree<FeesState> = {};

export const actions: ActionTree<FeesState, FeesState> = {
  async getTransactionFee({ dispatch, rootGetters }, { symbol, feeSymbol, address, type, force }: ZkFeeTransactionParams) {
    const syncProvider: RestProvider = await dispatch("zk-provider/requestProvider", null, { root: true });
    const cacheKey = `${type}-${symbol}-${feeSymbol}-${address}`;
    let fee: BigNumber;
    if (cache.get(cacheKey) && !force) {
      return <BigNumber>cache.get(cacheKey);
    }
    if (symbol === feeSymbol || !feeSymbol) {
      fee = (await syncProvider.getTransactionFee(type, address, symbol)).totalFee;
    } else {
      fee = await syncProvider.getTransactionsBatchFee([type, "Transfer"], [address, rootGetters["zk-account/address"]], feeSymbol);
    }
    fee = closestPackableTransactionFee(fee);
    cache.set(cacheKey, fee, 10000);
    return fee;
  },
  async getTransferBatchFee({ dispatch, rootGetters }, { feeSymbol, batch, force }: { feeSymbol: TokenSymbol; batch: ZkTransferBatchItem[]; force: boolean }) {
    const syncProvider: RestProvider = await dispatch("zk-provider/requestProvider", null, { root: true });
    const cacheKey = `TransferBatch-${feeSymbol}-${batch
      .map((txItem) => txItem.address.substr(1, 3) + "." + txItem.address.substr(txItem.address.length - 4, txItem.address.length))
      .join("-")}-${batch.map((txItem) => txItem.token).join("-")}`;
    if (cache.get(cacheKey) && !force) {
      return <BigNumber>cache.get(cacheKey);
    }
    let fee = await syncProvider.getTransactionsBatchFee(
      [...new Array(batch.length - 1).fill("Transfer"), "Transfer"],
      [...batch.map((e) => e.address), rootGetters["zk-account/loggedIn"] ? rootGetters["zk-account/address"] : batch[0].address],
      feeSymbol,
    );
    fee = closestPackableTransactionFee(fee);
    cache.set(cacheKey, fee, 10000);
    return fee;
  },
  async getTransferFee({ dispatch }, feeParams: ZkFeeParams) {
    return await dispatch("getTransactionFee", { ...feeParams, type: "Transfer" });
  },
  async getWithdrawFee({ dispatch }, feeParams: ZkFeeParams) {
    return await dispatch("getTransactionFee", { ...feeParams, type: "Withdraw" });
  },
  async getMintNFTFee({ dispatch }, feeParams: ZkFeeParams) {
    return await dispatch("getTransactionFee", { ...feeParams, type: "MintNFT" });
  },
  async getWithdrawNFTFee({ dispatch }, feeParams: ZkFeeParams) {
    return await dispatch("getTransactionFee", { ...feeParams, type: "WithdrawNFT" });
  },
  async getAccountActivationFee({ dispatch, rootGetters }, feeParams: ZkFeeParams) {
    return await dispatch("getTransactionFee", {
      ...feeParams,
      symbol: feeParams.feeSymbol,
      feeSymbol: feeParams.feeSymbol,
      address: rootGetters["zk-account/address"],
      type: {
        ChangePubKey: { onchainPubkeyAuth: false },
      },
    });
  },
};

export default () => ({
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
});
