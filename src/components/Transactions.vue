<template>
  <div class="transactionsPage dappPageWrapper">
    <block-modals-account-activation />
    <div class="tileBlock transactionsTile">
      <div class="tileHeadline h3">Transactions</div>
      <div class="transactionsListContainer genericListContainer">
        <div v-if="loadingStatus === 'main'" class="nothingFound">
          <loader class="_display-block" />
        </div>
        <div v-else-if="transactions.length === 0 && !loadingStatus" class="nothingFound" :class="{ loadMoreAvailable: !allLoaded }">
          <span>History is empty</span>
        </div>
        <transaction-history-item v-for="item in transactions" v-else :key="item.txHash" class="transactionItem" :transaction="item" />
        <i-button v-if="!loadingStatus && !allLoaded" block link size="lg" variant="secondary" @click="requestTransactions('previous')">Load more</i-button>
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
import { ZkTransactionHistoryLoadingState, ZkFilteredTransactionHistory } from "@matterlabs/zksync-nuxt-core/types";

let updateListInterval: ReturnType<typeof setInterval>;
export default Vue.extend({
  props: {
    token: {
      type: [String, Number],
      required: false,
      default: undefined,
    },
    address: {
      type: String,
      required: false,
      default: undefined,
    },
    tokenExists: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  data() {
    return {
      transactions: <ApiTransaction[]>[],
      loadingStatus: <ZkTransactionHistoryLoadingState>false,
      allLoaded: !this.tokenExists,
    };
  },
  watch: {
    tokenExists(val, oldVal) {
      if (!oldVal && val) {
        this.requestTransactions("main");
        this.updateLatest();
      }
    },
  },
  mounted() {
    if (this.tokenExists) {
      this.allLoaded = false;
      this.requestTransactions("main");
      this.updateLatest();
    }
  },
  beforeDestroy() {
    clearInterval(updateListInterval);
  },
  methods: {
    async requestTransactions(part: "main" | "previous" | "new") {
      if (this.loadingStatus !== false) {
        return;
      }

      this.$analytics.track("transaction_history_load_more");

      this.loadingStatus = part;
      const res: ZkFilteredTransactionHistory = await this.$store.dispatch("zk-history/getFilteredTransactionHistory", {
        lastTxHash: part === "previous" ? this.transactions[this.transactions.length - 1].txHash : undefined,
        token: this.token,
        address: this.address,
      });
      if (!res.error) {
        if (part === "main") {
          this.transactions = res.transactions;
        } else if (part === "previous") {
          this.transactions.push(...res.transactions);
        } else if (part === "new") {
          const previousTransactions = JSON.parse(JSON.stringify(this.transactions));
          const newTransactionHashes = new Set(res.transactions.map((e) => e.txHash));
          for (let a = previousTransactions.length - 1; a >= 0; a--) {
            if (newTransactionHashes.has(previousTransactions[a].txHash)) {
              previousTransactions.splice(a, 1);
            }
          }
          this.transactions = [...res.transactions, ...previousTransactions];
        }
        this.allLoaded = res.allLoaded;
      }
      this.loadingStatus = false;
    },
    updateLatest() {
      clearInterval(updateListInterval);
      updateListInterval = setInterval(async () => {
        if (!this.allLoaded) {
          await this.requestTransactions("new");
        }
      }, 30000);
    },
  },
});
</script>
