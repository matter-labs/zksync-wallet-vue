<template>
  <div class="transactionsPage">
    <div class="tileBlock transactionsTile">
      <div class="tileHeadline h3">Transactions</div>
      <div class="transactionsListContainer">
        <div v-if="loading === true" class="nothingFound">
          <loader class="_display-block" />
        </div>
        <div v-else-if="transactionsList.length === 0" class="nothingFound">
          <span>History is empty</span>
        </div>
        <SingleTransaction v-for="(item, index) in transactionsList" v-else :key="index" class="transactionItem" :single-transaction="item" />
        <i-button v-if="loadingMore === false && loadMoreAvailable === true" block link size="lg" variant="secondary" @click="loadMore()">Load more</i-button>
        <loader v-else-if="loadingMore === true" class="_display-block _margin-x-auto _margin-y-2" />
      </div>
    </div>
  </div>
</template>

<script>
import { walletData } from "@/plugins/walletData";
import SingleTransaction from "@/blocks/SingleTransaction";

export default {
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
      transactionsList: [],
      loading: true,
      addressToNameMap: new Map(),
      loadMoreAvailable: false,
      totalLoadedItem: 0,
      loadingMore: false,
    };
  },
  computed: {
    walletAddressFull() {
      return walletData.get().syncWallet.address();
    },
  },
  mounted() {
    this.getTransactions();
    try {
      if (!process.client || !window.localStorage.getItem("contacts-" + this.walletAddressFull)) {
        return;
      }
      const contactsList = JSON.parse(window.localStorage.getItem("contacts-" + this.walletAddressFull));
      if (!contactsList || !Array.isArray(contactsList)) {
        return;
      }
      for (const item of contactsList) {
        this.addressToNameMap.set(item.address.toLowerCase(), item.name);
      }
    } catch (error) {
      this.$store.dispatch("toaster/error", error.message ? error.message : "Error while loading transaction list");
    }
  },
  methods: {
    loadTransactions: async function (offset = 0) {
      const list = await this.$store.dispatch("wallet/getTransactionsHistory", { force: false, offset: offset });
      this.totalLoadedItem += list.length;
      this.loadMoreAvailable = list.length >= 25;
      let filteredList = list
        .filter((e) => e.tx.type !== "ChangePubKey")
        .map((e) => {
          if (e.tx.type === "Transfer" && e.tx.amount === "0" && e.tx.from === e.tx.to) {
            e.tx.feePayment = true;
          }
          return e;
        });
      if (this.filter) {
        filteredList = filteredList.filter((item) => (item.tx.priority_op ? item.tx.priority_op.token : item.tx.token) === this.filter);
      }
      if (this.address) {
        const addressLowerCase = this.address.toLowerCase();
        const myAddressLowerCase = this.walletAddressFull.toLowerCase();
        filteredList = filteredList.filter((item) => {
          if (item.tx.type === "Withdraw" || item.tx.type === "Transfer") {
            const addressToLowerCase = item.tx.to.toLowerCase();
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
      return filteredList.map((e) => ({ ...e, transactionStatus: this.getTransactionStatus(e) }));
    },
    getTransactions: async function () {
      this.loading = true;
      try {
        this.transactionsList = await this.loadTransactions();
      } catch (error) {
        await this.$store.dispatch("toaster/error", error.message ? error.message : "Error while fetching the transactions");
      }
      this.loading = false;
    },
    getTransactionStatus: function (transaction) {
      if (!transaction.success) {
        return transaction.fail_reason ? transaction.fail_reason : "Rejected";
      }
      if (transaction.verified) {
        return "Verified";
      } else if (transaction.commited) {
        return "Committed";
      } else {
        return "In progress";
      }
    },
    loadMore: async function () {
      this.loadingMore = true;
      const list = await this.loadTransactions(this.totalLoadedItem);
      this.transactionsList.push(...list);
      this.loadingMore = false;
    },
  },
};
</script>
