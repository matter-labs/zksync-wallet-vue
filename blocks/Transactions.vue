<template>
    <div class="transactionsPage">
        <div class="tileBlock transactionsTile">
            <div class="tileHeadline h3">Transactions</div>
            <!-- <i-input v-model="search" placeholder="Filter transactions">
                <i slot="prefix" class="far fa-search"></i>
            </i-input> -->
            <div class="transactionsListContainer">
                <div v-if="loading===true" class="nothingFound">
                    <i-loader class="_display-block" size="md" :variant="$inkline.config.variant === 'light' ? 'dark' : 'light'" />
                </div>
                <div v-else-if="transactionsList.length===0" class="nothingFound">
                    <span>History is empty</span>
                </div>
                <div v-for="(item, index) in transactionsList" v-else :key="index" class="transactionItem">
                    <div class="status">
                        <i-tooltip>
                            <i v-if="item.transactionStatus==='Verified'" class="verified far fa-check-double"></i>
                            <i v-else-if="item.transactionStatus==='Commited'" class="commited far fa-check"></i>
                            <i v-else-if="item.transactionStatus==='In progress'" class="inProgress fad fa-spinner-third"></i>
                            <template slot="body">{{item.transactionStatus}}</template>
                        </i-tooltip>
                    </div>
                    <div class="mainInfo">
                        <i-tooltip>
                            <div class="createdAt">{{getTimeAgo(item.created_at)}}</div>
                            <template slot="body">{{getFormatedTime(item.created_at)}}</template>
                        </i-tooltip>
                        <div class="amount">{{getFormatedAmount(item)}}</div>
                        <div class="token">{{item.tx.priority_op?item.tx.priority_op.token:item.tx.token}}</div>
                    </div>
                    <div class="actionInfo">
                        <div v-if="item.tx.type==='Withdraw'">
                            <div class="actionType">Withdrawn to:</div>
                            <div v-if="item.tx.to.toLowerCase()===walletAddressFull.toLowerCase()" class="actionValue">Your L1 account</div>
                            <nuxt-link v-else class="actionValue" :to="`/contacts?w=${item.tx.to}`">{{getAddressName(item.tx.to)}}</nuxt-link>
                        </div>
                        <div v-else-if="item.tx.type==='Deposit'">
                            <div class="actionType">Deposit to:</div>
                            <div class="actionValue">Your zkSync account</div>
                        </div>
                        <div v-else-if="item.tx.type==='Transfer'">
                            <div class="actionType">
                                <span v-if="item.tx.to.toLowerCase()===walletAddressFull.toLowerCase()">Received from:</span>
                                <span v-else>Sent to:</span>
                            </div>
                            <nuxt-link v-if="item.tx.to.toLowerCase()===walletAddressFull.toLowerCase()" class="actionValue" :to="`/contacts?w=${item.tx.from}`">{{getAddressName(item.tx.from)}}</nuxt-link>
                            <nuxt-link v-else class="actionValue" :to="`/contacts?w=${item.tx.to}`">{{getAddressName(item.tx.to)}}</nuxt-link>
                        </div>
                    </div>
                    <a class="button -md -secondary -link" target="_blank" :href="getTransactionExplorerLink(item)"><i class="fas fa-external-link"></i></a>
                </div>
                <i-button v-if="loadingMore===false && loadMoreAvailable===true" block link size="lg" variant="secondary" @click="loadMore()">Load more</i-button>
                <i-loader v-else-if="loadingMore===true" class="_display-block _margin-x-auto _margin-y-2" size="md" :variant="$inkline.config.variant === 'light' ? 'dark' : 'light'" />
            </div>
        </div>
    </div>
</template>

<script>
import moment from "moment";
import walletData from "@/plugins/walletData.js";
import handleExponentialNumber from "@/plugins/handleExponentialNumbers.js";
import handleFormatToken from "@/plugins/handleFormatToken.js";

export default {
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
      const contactsList = JSON.parse(window.localStorage.getItem("contacts-" + this.walletAddressFull));
      for (const item of contactsList) {
        this.addressToNameMap.set(item.address.toLowerCase(), item.name);
      }
    } catch (error) {
      console.log(error);
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
    getFormatedAmount: function ({ tx: { type, priority_op, token, amount } }) {
      return handleExponentialNumber(+handleFormatToken(type === "Deposit" ? priority_op?.token : token, type === "Deposit" && priority_op ? +priority_op.amount : +amount));
    },
    getTransactionExplorerLink: function (transaction) {
      return (
        (transaction.tx.type === "Deposit" ? `https://${process.env.APP_ETH_BLOCK_EXPLORER}/tx` : `https://${process.env.APP_ZKSYNC_BLOCK_EXPLORER}/transactions`) +
        `/${transaction.hash}`
      );
    },
    getTransactionStatus: function (transaction) {
      if (transaction.verified) {
        return "Verified";
      } else if (transaction.commited) {
        /* else if (transaction.commited && transaction.tx.type === 'Withdraw') {
                return 'Commited';
            } */
        return "Commited";
      } else {
        return "In progress";
        /* if (tx.tx.type === 'Deposit') {
                    status = status;
                }
                else {
                    if (!tx.commited && tx.tx.type === 'Withdraw') {
                        // status = 'Withdrawal in progress — it should take max. 60 min';
                        status =
                        handleTimeLeft().minutes < 0
                            ? 'Operation is taking a bit longer than usual, it should be right there!'
                            : `Max ${
                                isNaN(handleTimeLeft().timeLeft)
                                ? withdrawalTime
                                : `${handleCheckForHours}${minutesRelativelyToHours} min ${
                                    handleTimeLeft().seconds
                                    } sec`
                            }s left`;
                    }
                    else {
                        status = 'Transaction in progress';
                    }
                } */
      }
    },
    loadTransactions: async function (offset = 0) {
      const list = await this.$store.dispatch("wallet/getTransactionsHistory", { force: false, offset: offset });
      this.totalLoadedItem += list.length;
      this.loadMoreAvailable = list.length >= 25;
      return list.filter((e) => e.tx.type !== "ChangePubKey").map((e) => ({ ...e, transactionStatus: this.getTransactionStatus(e) }));
    },
    getTransactions: async function () {
      this.loading = true;
      try {
        this.transactionsList = await this.loadTransactions();
      } catch (error) {
        console.log(error);
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
