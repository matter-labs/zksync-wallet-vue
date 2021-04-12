<template>
  <div class="transactionsPage">
    <div class="tileBlock transactionsTile">
      <div class="tileHeadline h3">Transactions</div>
      <div class="transactionsListContainer">
        <div v-if="loading === true" class="nothingFound">
          <loader class="_display-block" />
        </div>
        <div v-else-if="transactionsList.length === 0 && !loadingMore" class="nothingFound" :class="{ loadMoreAvailable: loadMoreAvailable }">
          <span>History is empty</span>
        </div>
        <single-transaction v-for="item in transactionsList" v-else :key="item.hash" class="transactionItem" :single-transaction="item" />
        <i-button v-if="loadingMore === false && loadMoreAvailable === true" block link size="lg" variant="secondary" @click="loadMore()">Load more</i-button>
        <loader v-else-if="loadingMore === true" class="_display-block _margin-x-auto _margin-y-2" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import SingleTransaction from "@/components/SingleTransaction.vue";
import { Address } from "@/plugins/types";
import { ZkInTx } from "zksync/src/types";
import Vue from "vue";

let updateListInterval: ReturnType<typeof setInterval>;
export default Vue.extend({
  components: {
    SingleTransaction,
  },
  props: {
    filter: {
      type: String,
      default: "",
      required: false,
    },
    address: {
      type: String,
      default: "",
      required: false,
    },
  },
  data() {
    return {
      loading: true,
      addressToNameMap: new Map(),
      loadMoreAvailable: false,
      totalLoadedItem: 0,
      loadingMore: false,
    };
  },
  computed: {
    ownAddress(): Address {
      return this.$accessor.account.address || "";
    },
    transactionsList(): Array<Tx> {
      let list = this.$accessor.wallet.getTransactionsHistory;
      if (this.filter) {
        list = list.filter((item: ZkInTx) => (item.tx.priority_op ? item.tx.priority_op.token : item.tx.token) === this.filter);
      }
      if (this.address) {
        const addressLowerCase = this.address.toLowerCase();
        const myAddressLowerCase = this.ownAddress.toLowerCase();
        list = list.filter((item: ZkInTx) => {
          if (item.tx.type === "Withdraw" || item.tx.type === "Transfer") {
            const addressToLowerCase = item.tx.to?.toLowerCase();
            const addressFromLowerCase = item.tx.from.toLowerCase();
            if (
              (item.tx.type === "Withdraw" && addressToLowerCase === addressLowerCase) ||
              (item.tx.type === "Transfer" &&
                ((addressToLowerCase === myAddressLowerCase && addressFromLowerCase === addressLowerCase) ||
                  (addressFromLowerCase === myAddressLowerCase && addressToLowerCase === addressLowerCase)))
            ) {
              return true;
            }
          }
          return false;
        });
      }
      return list;
    },
  },
  mounted() {
    this.autoUpdateList();
    this.getTransactions();
  },
  beforeDestroy() {
    clearInterval(updateListInterval);
  },
  methods: {
    async loadTransactions(offset: number = 0): Promise<Array<Tx>> {
      const list = await this.$accessor.wallet.requestTransactionsHistory({ force: false, offset });
      this.totalLoadedItem += list.length;
      this.loadMoreAvailable = list.length >= 25; /* 25 transactions are loaded for each request */
      let filteredList = list;
      if (this.filter) {
        filteredList = filteredList.filter((item: ZkInTx) => (item.tx.priority_op ? item.tx.priority_op.token : item.tx.token) === this.filter);
      }
      if (this.address) {
        const addressLowerCase = this.address.toLowerCase();
        const myAddressLowerCase = this.ownAddress.toLowerCase();
        filteredList = filteredList.filter((item: ZKInTx) => {
          if (item.tx.type === "Withdraw" || item.tx.type === "Transfer") {
            const addressToLowerCase = item.tx.to?.toLowerCase();
            const addressFromLowerCase = item.tx.from.toLowerCase();
            if (
              (item.tx.type === "Withdraw" && addressToLowerCase === addressLowerCase) ||
              (item.tx.type === "Transfer" &&
                ((addressToLowerCase === myAddressLowerCase && addressFromLowerCase === addressLowerCase) ||
                  (addressFromLowerCase === myAddressLowerCase && addressToLowerCase === addressLowerCase)))
            ) {
              return true;
            }
          }
          return false;
        });
      }
      return filteredList;
    },
    async getTransactions(): Promise<void> {
      this.loading = true;
      try {
        await this.loadTransactions();
      } catch (error) {
        await this.$accessor.toaster.error(error.message ? error.message : "Error while fetching the transactions");
      }
      this.loading = false;
    },
    async loadMore(): Promise<void> {
      await this.autoUpdateList();
      this.loadingMore = true;
      await this.loadTransactions(this.totalLoadedItem);
      this.loadingMore = false;
    },
    autoUpdateList(): void {
      clearInterval(updateListInterval);
      updateListInterval = setInterval(() => {
        if (this.totalLoadedItem <= 25) {
          this.loadTransactions();
        }
      }, 120000);
    },
  },
});
</script>
