<template>
  <div class="transactionsingleTransaction">
    <div class="status">
      <i-tooltip>
        <em v-if="singleTransaction.verified"  class="verified far fa-check-double"></em>
        <em v-else-if="singleTransaction.commited" class="committed far fa-check"></em>
        <em v-else-if="singleTransaction.transactionStatus === 'In progress'" class="inProgress fad fa-spinner-third"></em>
        <em v-else class="rejected fas fa-times-circle"></em>
        <template slot="body">{{ singleTransaction.transactionStatus }}</template>
      </i-tooltip>
    </div>
    <div class="mainInfo">
      <i-tooltip>
        <div class="createdAt">{{ singleTransaction.created_at | formatTimeAgo }}</div>
        <template slot="body">{{ singleTransaction.created_at | formatDateTime }}</template>
      </i-tooltip>
      <div class="amount" :class="{ small: getFormattedAmount(singleTransaction).length > 10 }">{{ getFormattedAmount(singleTransaction) }}</div>
      <div class="tokenSymbol">{{ getTxSymbol(singleTransaction) }}</div>
    </div>
    <div class="actionInfo">
      <div v-if="singleTransaction.tx.type === 'Withdraw'">
        <div class="actionType">Withdrawn to:</div>
        <div v-if="singleTransaction.tx.to.toLowerCase() === walletAddressFull.toLowerCase()" class="actionValue">Your L1 account</div>
        <nuxt-link v-else class="actionValue" :to="`/contacts?w=${singleTransaction.tx.to}`">{{ getAddressName(singleTransaction.tx.to) }}</nuxt-link>
      </div>
      <div v-else-if="singleTransaction.tx.type === 'Deposit'">
        <div class="actionType">Deposit to:</div>
        <div class="actionValue">Your zkSync account</div>
      </div>
      <div v-else-if="singleTransaction.tx.type === 'Transfer'">
        <div class="actionType">
          <span v-if="singleTransaction.tx.feePayment">Fee transaction</span>
          <span v-else-if="singleTransaction.tx.to.toLowerCase() === walletAddressFull.toLowerCase()">Received from:</span>
          <span v-else>Sent to:</span>
        </div>
        <span v-if="singleTransaction.tx.feePayment === true"></span>
        <nuxt-link v-else-if="singleTransaction.tx.to.toLowerCase() === walletAddressFull.toLowerCase()" class="actionValue" :to="`/contacts?w=${singleTransaction.tx.from}`"
          >{{ getAddressName(singleTransaction.tx.from) }}
        </nuxt-link>
        <nuxt-link v-else class="actionValue" :to="`/contacts?w=${singleTransaction.tx.to}`">{{ getAddressName(singleTransaction.tx.to) }}</nuxt-link>
      </div>
      <div v-else-if="singleTransaction.tx.type === 'ChangePubKey'">
        <div class="actionType">Account activation</div>
      </div>
    </div>
    <a class="button -md -secondary -link" target="_blank" :href="getTransactionExplorerLink(singleTransaction)"><i class="fas fa-external-link"></i></a>
  </div>
</template>
<script>
import { APP_ETH_BLOCK_EXPLORER, APP_ZKSYNC_BLOCK_EXPLORER } from "@/plugins/build";
import utils from "@/plugins/utils";
import { walletData } from "@/plugins/walletData";

export default {
  props: {
    singleTransaction: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      addressToNameMap: new Map(),
    };
  },
  computed: {
    walletAddressFull() {
      return walletData.get().syncWallet.address();
    },
  },
  methods: {
    getFormattedAmount(transaction) {
      const symbol = this.getTxSymbol(transaction);
      if (!transaction.tx.feePayment && transaction.tx.type !== "ChangePubKey") {
        return utils.handleFormatToken(symbol, transaction.tx.type === "Deposit" && transaction.tx.priority_op ? transaction.tx.priority_op.amount : transaction.tx.amount);
      } else if (transaction.tx.type === "ChangePubKey") {
        return utils.handleFormatToken(symbol, transaction.tx.fee);
      } else {
        return utils.handleFormatToken(transaction.tx.token, transaction.tx.fee);
      }
    },
    getTxSymbol({ tx: { type, priority_op, token, feeToken } }) {
      if (type === "Deposit") {
        return priority_op.token;
      } else if (type === "ChangePubKey") {
        return this.$store.getters["tokens/getTokenByID"](feeToken).symbol;
      } else {
        return token;
      }
    },
    getAddressName(address) {
      address = address.toLowerCase();
      if (this.addressToNameMap.has(address)) {
        return this.addressToNameMap.get(address);
      } else {
        return address.replace(address.slice(6, address.length - 3), "...");
      }
    },

    getTransactionExplorerLink(transaction) {
      return (transaction.tx.type === "Deposit" ? `${APP_ETH_BLOCK_EXPLORER}/tx` : `${APP_ZKSYNC_BLOCK_EXPLORER}/transactions`) + `/${transaction.hash}`;
    },
  },
};
</script>
