<!-- @ts-ignore -->
<template>
  <div class="transactionsingleTransaction">
    <div class="status">
      <i-tooltip>
        <em :class="transactionStatus.icon"></em>
        <template slot="body">{{ transactionStatus.text }}</template>
      </i-tooltip>
    </div>
    <div class="mainInfo">
      <i-tooltip>
        <div class="createdAt">{{ timeAgo }}</div>
        <template slot="body">{{ singleTransaction.created_at | formatDateTime }}</template>
      </i-tooltip>
      <div :class="{ small: getFormattedAmount(singleTransaction).length > 10 }" class="amount">{{ getFormattedAmount(singleTransaction) }}</div>
      <div class="tokenSymbol">{{ tokenSymbol }}</div>
    </div>
    <div class="actionInfo">
      <div class="actionType">
        <span>{{ transactionTypeData.type }}</span>
        <i-tooltip v-if="transactionTypeData.tooltip">
          <em v-if="transactionTypeData.tooltip" :class="transactionTypeData.tooltip.icon" />
          <div slot="body" v-html="transactionTypeData.tooltip.html"></div>
        </i-tooltip>
      </div>
      <div v-if="transactionTypeData.showAddress && isSameAddress(displayedAddress)" class="actionValue">Your L1 account</div>
      <nuxt-link v-else-if="transactionTypeData.showAddress && displayedAddress" class="actionValue" :to="`/contacts?w=${displayedAddress}`"
        >{{ getAddressName(displayedAddress) }}
      </nuxt-link>
      <a v-if="ethTx" :href="ethTx" target="_blank" class="linkText">Ethereum Transaction</a>
    </div>
    <a class="button -md -secondary -link" target="_blank" :href="getTransactionExplorerLink(singleTransaction)">
      <i class="ri-external-link-line"></i>
    </a>
  </div>
</template>

<script lang="ts">
import { APP_ETH_BLOCK_EXPLORER, APP_ZKSYNC_BLOCK_EXPLORER } from "@/plugins/build";
import { Address, Provider, TokenSymbol, Tx, zkTx } from "@/plugins/types";
import utils from "@/plugins/utils";
import { walletData } from "@/plugins/walletData";

import moment from "moment";
import Vue from "vue";

let getTimeAgoInterval = undefined as any;
export default Vue.extend({
  props: {
    singleTransaction: {
      type: zkTx,
      required: true,
    },
  },
  data() {
    return {
      timeAgo: "",
      ethTx: "",
    };
  },
  computed: {
    isFeeTransaction(): boolean {
      return (
        this.singleTransaction.tx.type === "ChangePubKey" ||
        (this.singleTransaction.tx.type === "Transfer" && this.singleTransaction.tx.amount === "0" && this.singleTransaction.tx.from === this.singleTransaction.tx.to)
      );
    },
    walletAddressFull(): Address {
      return this.$accessor.account.address;
    },
    displayedAddress(): any {
      return this.singleTransaction.tx.type === "Transfer"
        ? this.isSameAddress(this.singleTransaction.tx.to as string)
          ? this.singleTransaction.tx.from
          : this.singleTransaction.tx.to
        : this.singleTransaction.tx.priority_op
        ? this.singleTransaction.tx.priority_op.to
        : this.singleTransaction.tx.to;
    },
    transactionStatus(): { text: string; icon: string } {
      if (!this.singleTransaction.success) {
        return {
          text: this.singleTransaction.fail_reason ? this.singleTransaction.fail_reason : "Rejected",
          icon: "rejected ri-close-circle-fill",
        };
      }
      if (this.singleTransaction.verified) {
        return {
          text: "Finalized",
          icon: "verified ri-check-double-line",
        };
      } else if (this.singleTransaction.commited) {
        return {
          text: "Committed",
          icon: "committed ri-check-line",
        };
      } else {
        return {
          text: "In progress",
          icon: "inProgress ri-loader-5-line",
        };
      }
    },
    transactionTypeData(): { type: string; showAddress: boolean; tooltip: false | { icon: string; html: string } } {
      switch (this.singleTransaction.tx.type) {
        case "Withdraw":
          return {
            type: "Withdrawn to:",
            showAddress: true,
            tooltip: false,
          };
        case "ChangePubKey":
          return {
            type: "Account activation",
            showAddress: false,
            tooltip: {
              icon: "ri-information-fill",
              html: `Activation is required single-time payment to set the signing key associated with the account.<br>Without it no operation can be authorized by your corresponding account.`,
            },
          };
        case "Deposit":
          return {
            type: "Deposit to:",
            showAddress: true,
            tooltip: false,
          };
        case "Transfer":
          if (this.isFeeTransaction) {
            return {
              type: "Fee transaction",
              showAddress: false,
              tooltip: false,
            };
          } else if (this.isSameAddress(this.displayedAddress)) {
            return {
              type: "Received from:",
              showAddress: true,
              tooltip: false,
            };
          } else {
            return {
              type: "Sent to:",
              showAddress: true,
              tooltip: false,
            };
          }
        default:
          return {
            type: this.singleTransaction.tx.type,
            showAddress: true,
            tooltip: false,
          };
      }
    },
    tokenSymbol(): TokenSymbol {
      return !this.isFeeTransaction
        ? this.singleTransaction.tx.priority_op
          ? this.singleTransaction.tx.priority_op.token
          : this.singleTransaction.tx.token
        : typeof this.singleTransaction.tx.feeToken === "number"
        ? this.$accessor.tokens.getTokenByID(this.singleTransaction.tx.feeToken).symbol
        : this.singleTransaction.tx.priority_op
        ? this.singleTransaction.tx.priority_op.token
        : this.singleTransaction.tx.token;
    },
  },
  mounted() {
    // @ts-ignore
    this.timeAgo = this.getTimeAgo(this.singleTransaction.created_at);
    getTimeAgoInterval = setInterval(() => {
      if (!this.singleTransaction) {
        return clearInterval(getTimeAgoInterval);
      }
      // @ts-ignore
      this.timeAgo = this.getTimeAgo(this.singleTransaction.created_at);
    }, 30000);
    this.getWithdrawalTx();
  },
  beforeDestroy() {
    clearInterval(getTimeAgoInterval);
  },
  methods: {
    isSameAddress(address: string): boolean {
      return String(address).toLowerCase() === this.walletAddressFull.toLowerCase();
    },
    getTimeAgo(time: any): string {
      return moment(time).fromNow();
    },
    getFormattedAmount({ tx: { type, priority_op, amount, fee } }: Tx): string {
      return !this.isFeeTransaction
        ? utils.handleFormatToken(this.tokenSymbol, type === "Deposit" && priority_op ? priority_op.amount : amount)
        : utils.handleFormatToken(this.tokenSymbol, fee);
    },
    getAddressName(address: string): string {
      address = address ? String(address).toLowerCase() : "";
      const contactFromStore = this.$accessor.contacts.getByAddress(address);
      return contactFromStore ? contactFromStore.name : address.replace(address.slice(6, address.length - 3), "...");
    },
    getTransactionExplorerLink(transaction: Tx): string {
      return (transaction.tx.type === "Deposit" ? `${APP_ETH_BLOCK_EXPLORER}/tx` : `${APP_ZKSYNC_BLOCK_EXPLORER}/transactions`) + `/${transaction.hash}`;
    },
    async getWithdrawalTx() {
      const singleTx: Tx = this.singleTransaction;
      if (singleTx && singleTx.tx.type === "Withdraw") {
        const txFromStore = this.$accessor.transaction.getWithdrawalTx(singleTx.hash);
        if (txFromStore) {
          this.ethTx = `${APP_ETH_BLOCK_EXPLORER}/tx/${txFromStore}`;
        } else {
          const syncProvider = walletData.get().syncProvider as Provider;
          const ethTx = await syncProvider!.getEthTxForWithdrawal(singleTx.hash);
          if (ethTx) {
            this.ethTx = `${APP_ETH_BLOCK_EXPLORER}/tx/${ethTx}`;
            this.$accessor.transaction.setWithdrawalTx({ tx: singleTx.hash, ethTx });
          }
        }
      }
    },
  },
});
</script>
