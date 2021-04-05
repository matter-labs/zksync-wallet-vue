<template>
  <div class="transactionsingleTransaction">
    <div class="status">
      <i-tooltip>
        <em v-if="singleTransaction.transactionStatus === 'Verified'" class="verified ri-check-double-line"></em>
        <em v-else-if="singleTransaction.transactionStatus === 'Committed'" class="committed ri-check-line"></em>
        <em v-else-if="singleTransaction.transactionStatus === 'In progress'" class="inProgress ri-loader-5-line"></em>
        <em v-else class="rejected ri-close-circle-fill"></em>
        <template slot="body">{{ singleTransaction.transactionStatus }}</template>
      </i-tooltip>
    </div>
    <div class="mainInfo">
      <i-tooltip>
        <div class="createdAt">{{ timeAgo }}</div>
        <template slot="body">{{ singleTransaction.created_at | formatDateTime }}</template>
      </i-tooltip>
      <div :class="{ small: getFormattedAmount(singleTransaction).length > 10 }" class="amount">{{ getFormattedAmount(singleTransaction) }}</div>
      <div class="tokenSymbol">{{ singleTransaction.tx.priority_op ? singleTransaction.tx.priority_op.token : singleTransaction.tx.token }}</div>
    </div>
    <div class="actionInfo">
      <div v-if="singleTransaction.tx.type === 'Withdraw'">
        <div class="actionType">Withdrawn to:</div>
        <div v-if="singleTransaction.tx.to.toLowerCase() === walletAddressFull.toLowerCase()" class="actionValue">Your L1 account</div>
        <nuxt-link v-else class="actionValue" :to="`/contacts?w=${singleTransaction.tx.to}`">{{ getAddressName(singleTransaction.tx.to) }}</nuxt-link>
        <a v-if="ethTx" :href="ethTx" target="_blank" class="linkText">Ethereum Transaction</a>
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
    </div>
    <a class="button -md -secondary -link" target="_blank" :href="getTransactionExplorerLink(singleTransaction)"><i class="ri-external-link-line"></i></a>
  </div>
</template>
<script lang="ts">
import { APP_ETH_BLOCK_EXPLORER, APP_ZKSYNC_BLOCK_EXPLORER } from "@/plugins/build";
import { Address, Provider, Tx } from "@/plugins/types";
import utils from "@/plugins/utils";
import { walletData } from "@/plugins/walletData";

import moment from "moment";
import Vue from "vue";

let getTimeAgoInterval = undefined as any;
export default Vue.extend({
  props: {
    singleTransaction: {
      type: Object,
      required: true,
      default: undefined,
    },
  },
  data() {
    return {
      timeAgo: "",
      ethTx: "",
    };
  },
  computed: {
    walletAddressFull(): Address {
      return this.$store.getters["account/address"];
    },
  },
  mounted() {
    this.timeAgo = this.getTimeAgo(this.singleTransaction.created_at);
    getTimeAgoInterval = setInterval(() => {
      this.timeAgo = this.getTimeAgo(this.singleTransaction.created_at);
    }, 30000);
    this.getWithdrawalTx();
  },
  beforeDestroy() {
    clearInterval(getTimeAgoInterval);
  },
  methods: {
    getTimeAgo(time: any): string {
      return moment(time).fromNow();
    },
    getFormattedTime(time: Date): string {
      return moment(time).format("M/D/YYYY h:mm:ss A");
    },
    getFormattedAmount({ tx: { type, priority_op, token, amount, fee, feePayment } }: Tx): string {
      const symbol = type === "Deposit" ? priority_op!.token : token;
      if (!feePayment) {
        return utils.handleFormatToken(symbol as string, type === "Deposit" && priority_op ? priority_op.amount : amount);
      } else {
        return utils.handleFormatToken(token as string, fee);
      }
    },
    getAddressName(address: string): string {
      address = address.toLowerCase();
      const contactFromStore = this.$store.getters["contacts/getByAddress"](address);
      if (contactFromStore) {
        return contactFromStore.name;
      } else {
        return address.replace(address.slice(6, address.length - 3), "...");
      }
    },
    getTransactionExplorerLink(transaction: Tx): string {
      return (transaction.tx.type === "Deposit" ? `${APP_ETH_BLOCK_EXPLORER}/tx` : `${APP_ZKSYNC_BLOCK_EXPLORER}/transactions`) + `/${transaction.hash}`;
    },
    getTransactionStatus(transaction: Tx): string {
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
    async getWithdrawalTx() {
      if (this.singleTransaction.tx.type === "Withdraw") {
        const txFromStore = this.$store.getters["transaction/getWithdrawalTx"](this.singleTransaction.hash);
        if (txFromStore) {
          this.ethTx = `${APP_ETH_BLOCK_EXPLORER}/tx/${txFromStore}`;
        } else {
          const syncProvider = walletData.get().syncProvider as Provider;
          const ethTx = await syncProvider!.getEthTxForWithdrawal(this.singleTransaction.hash);
          if (ethTx) {
            this.ethTx = `${APP_ETH_BLOCK_EXPLORER}/tx/${ethTx}`;
            this.$store.commit("transaction/setWithdrawalTx", { tx: this.singleTransaction.hash, ethTx });
          }
        }
      }
    },
  },
});
</script>
