<template>
  <div class="transactionsPage dappPageWrapper">
    <block-modals-account-activation />
    <div class="tileBlock transactionsTile">
      <div class="tileHeadline h3">Transactions</div>
      <div class="_display-flex _justify-content-space-between transactionsButtonGroup _margin-bottom-1">
        <i-button
          block
          class="_margin-y-0 _margin-right-1 _padding-right-2"
          data-cy="account_deposit_button"
          size="md"
          :href="accountZkScanUrl"
          target="_blank"
          variant="secondary"
        >
          <v-icon class="planeIcon" name="ri-external-link-line" />&nbsp;View in Explorer
        </i-button>
        <i-button
          block
          class="_margin-y-0 _padding-right-1 _margin-right-1"
          data-cy="account_send_zksync_button"
          size="md"
          :href="exportLink"
          target="_blank"
          variant="secondary"
        >
          <v-icon class="planeIcon" name="ri-file-line" />&nbsp;Export
        </i-button>
      </div>
      <div class="transactionsListContainer genericListContainer">
        <div v-if="loadingStatus === 'main'" class="nothingFound">
          <loader class="_display-block" />
        </div>
        <div
          v-else-if="transactions.length === 0 && !loadingStatus"
          class="nothingFound"
          :class="{ loadMoreAvailable: !transactionHistoryAllLoaded }"
        >
          <span>History is empty</span>
        </div>
        <transaction-history-item
          v-for="item in transactions"
          v-else
          :key="item.txHash"
          class="transactionItem"
          :transaction="item"
        />
        <i-button
          v-if="!loadingStatus && !transactionHistoryAllLoaded"
          block
          link
          size="lg"
          variant="secondary"
          @click="loadMore()"
          >Load more
        </i-button>
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
import { ZkTransactionHistoryLoadingState } from "@matterlabs/zksync-nuxt-core/types";

let updateListInterval: ReturnType<typeof setInterval>;
export default Vue.extend({
  computed: {
    transactions(): ApiTransaction[] {
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
    accountAddress(): string {
      return this.$store.getters["zk-account/address"];
    },
    accountZkScanUrl(): string {
      console.log(this.$store.getters["zk-onboard/config"]);
      return (this.$store.getters["zk-onboard/config"].zkSyncNetwork.explorer +
        "explorer/accounts/" +
        this.accountAddress) as string;
    },
    exportLink(): string {
      const network = this.$store.getters["zk-onboard/config"].ethereumNetwork.name;
      return `https://zkexport-lite.netlify.app/export/account/transactions?address=${this.accountAddress}&network=${network}`;
    },
  },
  async mounted() {
    if (!this.transactionHistoryRequested) {
      await this.$store.dispatch("zk-history/getTransactionHistory");
    }
    await this.updateLatest();
  },
  beforeDestroy() {
    clearInterval(updateListInterval);
  },
  methods: {
    loadMore() {
      this.$analytics.track("transaction_history_load_more");
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
