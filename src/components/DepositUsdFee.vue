<template>
  <div class="depositUSDFee">
    <b>Fee:</b>
    <span v-if="depositFeeLoading">Loading...</span>
    <span v-else-if="depositFee && !depositFeeLoading">
      <token-price symbol="ETH" :amount="depositFee" />
    </span>
    <span v-else class="errorText">Calculating fee error. <u class="_cursor-pointer" @click="getEstimatedDepositFee()">Try Again</u></span>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { BigNumber } from "@ethersproject/bignumber";
import { ETH_RECOMMENDED_DEPOSIT_GAS_LIMIT } from "zksync/build/utils";
import { BigNumberish } from "ethers";

export default Vue.extend({
  data() {
    return {
      depositFee: <BigNumberish | undefined>undefined,
      depositFeeLoading: true,
    };
  },
  mounted() {
    this.getEstimatedDepositFee();
  },
  methods: {
    async getEstimatedDepositFee(): Promise<void> {
      this.depositFeeLoading = true;
      try {
        const gasPrice = await this.$store.getters["zk-onboard/web3Provider"].getGasPrice();
        const total = BigNumber.from(ETH_RECOMMENDED_DEPOSIT_GAS_LIMIT);
        this.depositFee = gasPrice.mul(total).toString();
      } catch (error) {
        console.warn("Error calculating estimated deposit fee\n", error);
      }
      this.depositFeeLoading = false;
    },
  },
});
</script>
