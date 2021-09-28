<template>
  <div class="loadingBlock tileBlock">
    <div class="tileHeadline h3">{{ activeTransaction.type }}</div>
    <div class="loadingBlockContent">
      <a v-if="txLink" :href="txLink" class="_display-block _text-center" target="_blank">
        Link to the transaction <i><v-icon name="ri-external-link-line" scale="0.8" /></i>
      </a>
      <p class="_display-block _text-center">{{ tip }}</p>
    </div>
    <div class="spinnerContainer _padding-y-2">
      <loader />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { ZkActiveTransaction, ZkConfig } from "matter-dapp-module/types";

export default Vue.extend({
  name: "LoadingBlock",
  data() {
    return {
      forceUpdateVal: Number.MIN_SAFE_INTEGER,
    };
  },
  computed: {
    config(): ZkConfig {
      return this.$store.getters["zk-onboard/config"];
    },
    activeTransaction(): ZkActiveTransaction {
      return this.$store.getters["zk-transaction/activeTransaction"];
    },
    txLink(): string | undefined {
      this.forceUpdateVal;
      if (!this.activeTransaction.txHash) {
        return undefined;
      }
      switch (this.activeTransaction.type) {
        case "Mint":
        case "Allowance":
        case "Deposit":
          return this.config.ethereumNetwork.explorer + "tx/" + this.activeTransaction.txHash;

        default:
          return this.config.zkSyncNetwork.explorer + "explorer/transactions/" + this.activeTransaction.txHash;
      }
    },
    tip(): string {
      switch (this.activeTransaction.step) {
        case "processing":
          return "Processing...";
        case "requestingLatestFees":
          return "Requesting fees...";
        case "awaitingUserAction":
          return "Waiting for your action...";
        case "waitingForUserConfirmation":
          return "Follow the instructions in your Ethereum wallet";
        case "committing":
          return "Waiting for the transaction to be committed...";
        case "updating":
          return "Updating account information...";
        default:
          return "";
      }
    },
  },
  watch: {
    activeTransaction: {
      deep: true,
      handler() {
        this.forceUpdateVal++;
      },
    },
  },
});
</script>
