<template>
  <div class="transactionsPage">
    <div class="tileBlock transactionsTile">
      <div class="tileHeadline h3">Transactions</div>
      <div class="transactionsListContainer">
        <div v-if="loading===true" class="nothingFound">
          <i-loader class="_display-block" size="md" :variant="$inkline.config.variant === 'light' ? 'dark' : 'light'"/>
        </div>
        <div v-else-if="transactionsList.length===0" class="nothingFound">
          <span>History is empty</span>
        </div>
        <div v-for="(item, index) in transactionsList" v-else :key="index" class="transactionItem">
          <div class="status">
            <i-tooltip>
              <em v-if="item.transactionStatus==='Verified'" class="verified far fa-check-double"></em>
              <em v-else-if="item.transactionStatus==='Commited'" class="commited far fa-check"></em>
              <em v-else-if="item.transactionStatus==='In progress'" class="inProgress fad fa-spinner-third"></em>
              <em v-else class="rejected fas fa-times-circle"></em>
              <template slot="body">{{ item.transactionStatus }}</template>
            </i-tooltip>
          </div>
          <div class="mainInfo">
            <i-tooltip>
              <div class="createdAt">{{getTimeAgo(item.created_at)}}</div>
              <template slot="body">{{getFormatedTime(item.created_at)}}</template>
            </i-tooltip>
            <div class="amount">{{getFormattedAmount(item)}}</div>
            <div class="token">{{ item.tx.priority_op ? item.tx.priority_op.token:item.tx.token }}</div>
          </div>
          <div class="actionInfo">
            <div v-if="item.tx.type==='Withdraw'">
              <div class="actionType">Withdrawn to:</div>
              <div v-if="item.tx.to.toLowerCase()===walletAddressFull.toLowerCase()" class="actionValue">Your L1
                account
              </div>
              <nuxt-link v-else class="actionValue" :to="`/contacts?w=${item.tx.to}`">{{ getAddressName(item.tx.to) }}
              </nuxt-link>
            </div>
            <div v-else-if="item.tx.type==='Deposit'">
              <div class="actionType">Deposit to:</div>
              <div class="actionValue">Your zkSync account</div>
            </div>
            <div v-else-if="item.tx.type==='Transfer'">
              <div class="actionType">
                <span v-if="item.tx.feePayment">Fee transaction</span>
                <span v-else-if="item.tx.to.toLowerCase()===walletAddressFull.toLowerCase()">Received from:</span>
                <span v-else>Sent to:</span>
              </div>
              <span v-if="item.tx.feePayment===true"></span>
              <nuxt-link v-else-if="item.tx.to.toLowerCase()===walletAddressFull.toLowerCase()" class="actionValue"
                         :to="`/contacts?w=${item.tx.from}`">{{ getAddressName(item.tx.from) }}
              </nuxt-link>
              <nuxt-link v-else class="actionValue" :to="`/contacts?w=${item.tx.to}`">{{ getAddressName(item.tx.to) }}
              </nuxt-link>
            </div>
          </div>
          <a class="button -md -secondary -link" target="_blank" :href="getTransactionExplorerLink(item)"><i
              class="fas fa-external-link"></i></a>
        </div>
        <i-button v-if="loadingMore===false && loadMoreAvailable===true" block link size="lg" variant="secondary"
                  @click="loadMore()">Load more
        </i-button>
        <i-loader v-else-if="loadingMore===true" class="_display-block _margin-x-auto _margin-y-2" size="md"
                  :variant="$inkline.config.variant === 'light' ? 'dark' : 'light'"/>
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import { walletData } from "@/plugins/walletData";
import utils from "@/plugins/utils";
import { APP_ETH_BLOCK_EXPLORER, APP_ZKSYNC_BLOCK_EXPLORER } from "@/plugins/build";

export default {
  props: {
    filter: {
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
    walletAddressFull: function () {
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
    getAddressName: function (address) {
      address = address.toLowerCase();
      if (this.addressToNameMap.has(address)) {
        return this.addressToNameMap.get(address);
      } else {
        return address.replace(address.slice(6, address.length - 3), "...");
      }
    },
    getTimeAgo: function (time) {
      return moment(time).fromNow();
    },
    getFormatedTime: function (time) {
      return moment(time).format("M/D/YYYY h:mm:ss A");
    },
    getFormattedAmount: function ({ tx: { type, priority_op, token, amount, fee, feePayment } }) {
      const symbol = type === "Deposit" ? priority_op.token : token;
      if (!feePayment) {
        const formatToken = utils.handleFormatToken(symbol, type === "Deposit" && priority_op ? +priority_op.amount : +amount);
        return utils.handleExpNum(symbol, formatToken);
      } else {
        const formatToken = utils.handleFormatToken(token, +fee);
        return utils.handleExpNum(symbol, formatToken);
      }
    },
    getTransactionExplorerLink: function (transaction) {
      return (transaction.tx.type === "Deposit" ? `https://${APP_ETH_BLOCK_EXPLORER}/tx` : `${APP_ZKSYNC_BLOCK_EXPLORER}/transactions`) + `/${transaction.hash}`;
    },
    getTransactionStatus: function (transaction) {
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
    loadMore: async function () {
      this.loadingMore = true;
      const list = await this.loadTransactions(this.totalLoadedItem);
      this.transactionsList.push(...list);
      this.loadingMore = false;
    },
  },
};
</script>
