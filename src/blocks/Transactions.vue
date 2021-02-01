<template>
  <div class="transactionsPage">
    <div class="tileBlock transactionsTile">
      <div class="tileHeadline h3">Transactions</div>
      <div class="transactionsListContainer">
        <div v-if="loading===true" class="nothingFound">
          <loader class="_display-block"/>
        </div>
        <div v-else-if="transactionsList.length===0 && !loadingMore" class="nothingFound" :class="{'loadMoreAvailable': loadMoreAvailable}">
          <span>History is empty</span>
        </div>
        <single-transaction
            v-for="(item) in transactionsList"
            v-else
            :key="item.hash"
            class="transactionItem" :single-transaction="item" />
        <i-button v-if="loadingMore===false && loadMoreAvailable===true" block link size="lg" variant="secondary"
                  @click="loadMore()">Load more
        </i-button>
        <loader v-else-if="loadingMore===true" class="_display-block _margin-x-auto _margin-y-2"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Address, Tx } from '@/plugins/types'
import SingleTransaction from '@/components/SingleTransaction.vue'

let updateListInterval = undefined as any
export default Vue.extend({
  components: {
    SingleTransaction,
  },
  props: {
    filter: {
      type: String,
      default: '',
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
      /* transactionsList: [] as Array<Tx>, */
      loading: true,
      addressToNameMap: new Map(),
      loadMoreAvailable: false,
      totalLoadedItem: 0,
      loadingMore: false,
    };
  },
  computed: {
    walletAddressFull: function (): Address {
      return this.$store.getters['account/address'];
    },
    transactionsList: function (): Array<Tx> {
      const list = this.$store.getters['wallet/getTransactionsHistory'];
      this.totalLoadedItem += list.length;
      this.loadMoreAvailable = list.length >= 25;
      let filteredList = list
        .filter((e: Tx) => (e.tx.type !== "ChangePubKey" && !e.fail_reason))
        .map((e: Tx) => {
          if (e.tx.type === "Transfer" && e.tx.amount === "0" && e.tx.from === e.tx.to) {
            e.tx.feePayment = true;
          }
          return e;
        });
      if (this.filter) {
        filteredList = filteredList.filter((item: Tx) => (item.tx.priority_op ? item.tx.priority_op.token : item.tx.token) === this.filter);
      }
      if (this.address) {
        const addressLowerCase = this.address.toLowerCase();
        const myAddressLowerCase = this.walletAddressFull.toLowerCase();
        filteredList = filteredList.filter((item: Tx) => {
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
      return filteredList.map((e: Tx) => ({ ...e, transactionStatus: this.getTransactionStatus(e) }));
    },
  },
  methods: {
    loadTransactions: async function (offset: number = 0): Promise<Array<Tx>> {
      const list = await this.$store.dispatch("wallet/getTransactionsHistory", { force: false, offset: offset });
      this.totalLoadedItem += list.length;
      this.loadMoreAvailable = list.length >= 25;
      let filteredList = list
        .filter((e: Tx) => e.tx.type !== "ChangePubKey")
        .map((e: Tx) => {
          if (e.tx.type === "Transfer" && e.tx.amount === "0" && e.tx.from === e.tx.to) {
            e.tx.feePayment = true;
          }
          return e;
        });
      if (this.filter) {
        filteredList = filteredList.filter((item: Tx) => (item.tx.priority_op ? item.tx.priority_op.token : item.tx.token) === this.filter);
      }
      if (this.address) {
        const addressLowerCase = this.address.toLowerCase();
        const myAddressLowerCase = this.walletAddressFull.toLowerCase();
        filteredList = filteredList.filter((item: Tx) => {
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
      return filteredList.map((e: Tx) => ({ ...e, transactionStatus: this.getTransactionStatus(e) }));
    },
    getTransactions: async function (): Promise<void> {
      this.loading = true;
      try {
        await this.loadTransactions();
      } catch (error) {
        await this.$store.dispatch("toaster/error", error.message ? error.message : "Error while fetching the transactions");
      }
      this.loading = false;
    },
    getTransactionStatus: function (transaction: Tx): string {
      if (!transaction.success) {
        return transaction.fail_reason ? transaction.fail_reason : "Rejected";
      }
      if (transaction.verified) {
        return "Verified";
      } else if (transaction.commited) {
        return "Commited";

      } else {
        return "In progress";
      }
    },
    loadMore: async function (): Promise<void> {
      await this.autoUpdateList()
      this.loadingMore = true
      const list = await this.loadTransactions(this.totalLoadedItem)
      /*
      @todo: fix it up
      this.transactionsList.push(...list);
      */
      this.loadingMore = false
    },
    autoUpdateList: async function(): Promise<void> {
      clearInterval(updateListInterval);
      updateListInterval = setInterval(()=>{
        this.loadTransactions();
      },120000);
    }
  },
  mounted() {
    this.autoUpdateList();
    this.getTransactions();
  },
  beforeDestroy() {
    clearInterval(updateListInterval);
  },
});
</script>
