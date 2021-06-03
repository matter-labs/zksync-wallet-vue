<template>
  <div class="transactionsPage dappPageWrapper">
    <account-activation-modal />
    <div class="tileBlock transactionsTile">
      <div class="tileHeadline h3">Transactions</div>
      <div class="transactionsListContainer genericListContainer">
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
import AccountActivationModal from "@/blocks/modals/AccountActivation.vue";
import { ZkInTx } from "@/types/lib";
import { Address } from "zksync/build/types";
import Vue, { PropOptions } from "vue";

let updateListInterval: ReturnType<typeof setInterval>;
export default Vue.extend({
  components: {
    SingleTransaction,
    AccountActivationModal,
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
    } as PropOptions<Address>,
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
    transactionsList(): Array<ZkInTx> {
      let list = this.$accessor.wallet.getTransactionsHistory;
      if (this.filter) {
        let filter: string | number = "";
        if (this.filter.includes("NFT-")) {
          filter = parseInt(this.filter.substr(4, this.filter.length));
        } else {
          filter = this.filter;
        }
        if (filter) {
          list = list.filter((item: ZkInTx) => (item.tx.priority_op ? item.tx.priority_op.token : item.tx.token) === filter);
        }
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
    async loadTransactions(offset = 0): Promise<Array<ZkInTx>> {
      const list = await this.$accessor.wallet.requestTransactionsHistory({ force: false, offset });
      this.totalLoadedItem += list.length;
      this.loadMoreAvailable = list.length >= 25; /* 25 transactions are loaded for each request */
      return list;
    },
    async getTransactions(): Promise<void> {
      if (this.$accessor.wallet.getTransactionsHistory.length === 0) {
        this.loading = true;
      }
      try {
        await this.loadTransactions();
      } catch (error) {
        this.$toast.global.zkException({
          message: error.message ?? "Error while fetching the transactions",
        });
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
