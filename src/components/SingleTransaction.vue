<template>
  <div class="singleTransaction">
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
        <em v-if="transactionTypeData.modal" :class="transactionTypeData.modal.icon" class="modalOpenIcon" @click="openModal()" />
      </div>
      <div v-if="transactionTypeData.showAddress && isSameAddress(displayedAddress)" class="actionValue">Your own account</div>
      <nuxt-link v-else-if="transactionTypeData.showAddress && displayedAddress" :to="`/contacts?w=${displayedAddress}`" class="actionValue">
        {{ getAddressName(displayedAddress) }}
      </nuxt-link>
      <a v-if="ethTx" :href="ethTx" class="linkText" target="_blank">Ethereum Transaction</a>
    </div>
    <a :href="getTransactionExplorerLink(singleTransaction)" class="button -md -secondary -link" target="_blank">
      <i class="ri-external-link-line" />
    </a>
  </div>
</template>

<script lang="ts">
import { APP_ETH_BLOCK_EXPLORER, APP_ZKSYNC_BLOCK_EXPLORER } from "@/plugins/build";
import { walletData } from "@/plugins/walletData";

import moment from "moment-timezone";
import Vue, { PropOptions } from "vue";
import { Address, TokenSymbol } from "zksync/build/types";
import utils from "~/plugins/utils";
import { ZkInTx } from "~/types/lib";

let getTimeAgoInterval: NodeJS.Timeout;

export default Vue.extend({
  props: {
    singleTransaction: {
      type: Object,
      default: () => {},
      required: true,
    } as PropOptions<ZkInTx>,
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
      return this.$accessor.account.address || "";
    },
    displayedAddress(): Address {
      if (this.singleTransaction.tx.type === "Transfer") {
        if (this.isSameAddress(this.singleTransaction.tx.to || "")) {
          return this.singleTransaction.tx.from;
        }
      } else if (this.singleTransaction.tx.priority_op) {
        return this.singleTransaction.tx.priority_op.to;
      }
      return this.singleTransaction.tx.to || "";
    },
    transactionStatus(): { text: string; icon: string } {
      if (this.singleTransaction.success === false) {
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
    transactionTypeData(): { type: string; showAddress: boolean; modal: false | { icon: string; key: string } } {
      switch (this.singleTransaction.tx.type) {
        case "Withdraw":
          return {
            type: "Withdrawn to:",
            showAddress: true,
            modal: false,
          };
        case "ChangePubKey":
          return {
            type: "Account activation",
            showAddress: false,
            modal: {
              icon: "ri-information-fill",
              key: "AccountActivation",
            },
          };
        case "Deposit":
          return {
            type: "Deposit to:",
            showAddress: true,
            modal: false,
          };
        case "Transfer":
          if (this.isFeeTransaction) {
            return {
              type: "Fee transaction",
              showAddress: false,
              modal: false,
            };
          } else {
            if (this.isSameAddress(this.singleTransaction.tx.to || "")) {
              return {
                type: "Received from:",
                showAddress: true,
                modal: false,
              };
            }
            return {
              type: "Sent to:",
              showAddress: true,
              modal: false,
            };
          }
        default:
          return {
            type: this.singleTransaction.tx.type,
            showAddress: true,
            modal: false,
          };
      }
    },
    tokenSymbol(): TokenSymbol {
      if (!this.isFeeTransaction) {
        if (this.singleTransaction.tx.priority_op) {
          return this.singleTransaction.tx.priority_op.token;
        }
      } else if (typeof this.singleTransaction.tx.feeToken === "number") {
        return this.$accessor.tokens.getTokenByID(this.singleTransaction.tx.feeToken)!.symbol;
      } else if (this.singleTransaction.tx.priority_op) {
        return this.singleTransaction.tx.priority_op.token;
      }
      return this.singleTransaction.tx.token!;
    },
  },
  mounted() {
    this.timeAgo = this.getTimeAgo(this.singleTransaction.created_at);
    getTimeAgoInterval = setInterval(() => {
      if (!this.singleTransaction) {
        return clearInterval(getTimeAgoInterval);
      }
      this.timeAgo = this.getTimeAgo(this.singleTransaction.created_at);
    }, 30000);
    this.getWithdrawalTx();
  },
  beforeDestroy() {
    clearInterval(getTimeAgoInterval);
  },
  methods: {
    isSameAddress(address: string): boolean {
      return address.toLowerCase() === this.walletAddressFull.toLowerCase();
    },
    getTimeAgo(time: string): string {
      return moment(time).tz("UTC").fromNow();
    },
    getFormattedAmount({ tx: { type, priority_op, amount, fee } }: ZkInTx): string {
      if (!this.isFeeTransaction) {
        return utils.handleFormatToken(this.tokenSymbol, type === "Deposit" && priority_op ? priority_op.amount : amount);
      } else {
        return utils.handleFormatToken(this.tokenSymbol, fee);
      }
    },
    getAddressName(address: string): string {
      address = address ? address.toLowerCase() : "";
      const contactFromStore = this.$accessor.contacts.getByAddress(address);
      return contactFromStore ? contactFromStore.name : address.replace(address.slice(6, address.length - 3), "...");
    },
    getTransactionExplorerLink(transaction: ZkInTx): string {
      console.log(transaction);
      return (transaction.tx.type === "Deposit" ? `${APP_ETH_BLOCK_EXPLORER}/tx` : `${APP_ZKSYNC_BLOCK_EXPLORER}/transactions`) + `/${transaction?.hash}`;
    },
    openModal(): void {
      if (this.transactionTypeData.modal) {
        this.$accessor.openModal(this.transactionTypeData.modal.key);
      }
    },
    async getWithdrawalTx(): Promise<void> {
      if (this.singleTransaction.tx.type === "Withdraw") {
        const txFromStore: string | undefined = this.$accessor.transaction.getWithdrawalTx(this.singleTransaction!.hash);
        if (txFromStore) {
          this.ethTx = `${APP_ETH_BLOCK_EXPLORER}/tx/${txFromStore}`;
        } else {
          const ethTx = await walletData.get().syncProvider!.getEthTxForWithdrawal(this.singleTransaction!.hash);
          if (ethTx) {
            this.ethTx = `${APP_ETH_BLOCK_EXPLORER}/tx/${ethTx}`;
            this.$accessor.transaction.setWithdrawalTx({ tx: this.singleTransaction!.hash, ethTx });
          }
        }
      }
    },
  },
});
</script>
