<template>
  <div class="transactionsPage dappPageWrapper">
    <block-modals-account-activation />
    <div class="tileBlock transactionsTile">
      <div class="tileHeadline h3">Transactions</div>
      <div class="transactionsListContainer genericListContainer">
        <div v-if="loadingStatus === 'main'" class="nothingFound">
          <loader class="_display-block" />
        </div>
        <div v-else-if="transactions.length === 0 && !loadingStatus" class="nothingFound" :class="{ loadMoreAvailable: !transactionHistoryAllLoaded }">
          <span>History is empty</span>
        </div>
        <transaction-history-item v-for="item in transactions" v-else :key="item.txHash" class="transactionItem" :transaction="item" />
        <i-button v-if="!loadingStatus && !transactionHistoryAllLoaded" block link size="lg" variant="secondary" @click="loadMore()">Load more</i-button>
        <div v-else-if="loadingStatus === 'previous'">
          <loader class="_display-block _margin-x-auto _margin-y-2" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { ApiTransaction } from "zksync/build/types";
import { ZkTransactionHistoryLoadingState } from "matter-dapp-module/types";

let updateListInterval: ReturnType<typeof setInterval>;
export default Vue.extend({
  computed: {
    transactions(): ApiTransaction {
      return this.$store.getters["zk-history/transactionHistory"];
    },
    loadingStatus(): ZkTransactionHistoryLoadingState {
      return this.$store.getters["zk-history/transactionHistoryLoading"];
    },
    transactionHistoryRequested(): boolean {
      return this.$store.getters["zk-history/transactionHistoryRequested"];
    },
    transactionHistoryAllLoaded(): boolean {
      return this.$store.getters["zk-history/transactionHistoryAllLoaded"];
    },
  },
  async mounted() {
    if (!this.transactionHistoryRequested) {
      await this.$store.dispatch("zk-history/getTransactionHistory");
    }
    this.updateLatest();
  },
  beforeDestroy() {
    clearInterval(updateListInterval);
  },
  methods: {
    loadMore() {
      this.$store.dispatch("zk-history/getPreviousTransactionHistory");
    },
    async updateLatest() {
      await this.$store.dispatch("zk-history/getNewTransactionHistory");
      clearInterval(updateListInterval);
      updateListInterval = setInterval(async () => {
        if (!this.transactionHistoryAllLoaded) {
          await this.$store.dispatch("zk-history/getNewTransactionHistory");
        }
      }, 30000);
    },
  },
});
</script>
