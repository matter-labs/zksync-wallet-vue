<template>
  <div class="singleTransaction">
    <div class="status">
      <i-tooltip placement="right">
        <v-icon :name="transactionStatus.icon" :class="transactionStatus.class" />
        <template slot="body">{{ transactionStatus.text }}</template>
      </i-tooltip>
    </div>
    <div class="mainInfo">
      <i-tooltip>
        <div class="createdAt">{{ timeAgo }}</div>
        <template slot="body">{{ singleTransaction.created_at | formatDateTime }}</template>
      </i-tooltip>
      <div v-if="!isNFT" :class="{ small: getFormattedAmount(singleTransaction).length > 10 }" class="amount">{{ getFormattedAmount(singleTransaction) }}</div>
      <div v-if="!isMintNFT" class="tokenSymbol">
        <span v-if="isNFT && tokenSymbol && !isMintNFT">NFT-</span>
        <div v-else-if="isNFT && !isMintNFT && singleTransaction.tx.contentHash" class="nft">
          <span class="contentHash">{{ singleTransaction.tx.contentHash }}</span>
          <i-tooltip placement="left" trigger="click" class="copyContentHash" @click.native="copy(singleTransaction.tx.contentHash)">
            <div class="iconContainer">
              <v-icon name="ri-clipboard-line" />
              <span>Copy hash</span>
            </div>
            <template slot="body">Copied!</template>
          </i-tooltip>
        </div>
        {{ tokenSymbol }}
      </div>
    </div>
    <div class="actionInfo">
      <div class="actionType">
        <span>{{ transactionTypeData.type }}</span>
        <v-icon
          v-if="transactionTypeData.modal"
          class="modalOpenIcon"
          :name="transactionTypeData.modal.icon"
          scale="1.1"
          @click.native="$accessor.openModal(transactionTypeData.modal.key)"
        />
      </div>
      <div v-if="transactionTypeData.showAddress && isSameAddress(displayedAddress)" class="actionValue">Your own account</div>
      <nuxt-link v-else-if="transactionTypeData.showAddress && displayedAddress" class="actionValue" :to="`/contacts?w=${displayedAddress}`">
        {{ getAddressName(displayedAddress) }}
      </nuxt-link>
      <a v-if="ethTx" :href="ethTx" target="_blank" class="linkText">
        Ethereum Transaction
        <v-icon name="ri-external-link-line" scale="0.8" />
      </a>
    </div>
    <a class="button -md -secondary -link externalLink" target="_blank" :href="getTransactionExplorerLink(singleTransaction)">
      <v-icon name="ri-external-link-line" scale="0.8" />
    </a>
  </div>
</template>

<script lang="ts">
import { APP_ETH_BLOCK_EXPLORER, APP_ZKSYNC_BLOCK_EXPLORER } from "@/plugins/build";
import zkUtils from "@/plugins/utils";
import { walletData } from "@/plugins/walletData";
import { ZkInTx } from "@/types/lib";
import { utils } from "zksync";

import moment from "moment-timezone";
import Vue, { PropOptions } from "vue";
import { Address, TokenSymbol } from "zksync/build/types";

let getTimeAgoInterval: ReturnType<typeof setInterval>;
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
      if (this.singleTransaction.tx.type === "MintNFT") {
        // @ts-ignore
        return this.singleTransaction.tx?.recipient;
      }
      return this.singleTransaction.tx.to || "";
    },
    transactionStatus(): { text: string; icon: string; class: string } {
      if (this.singleTransaction.success === false) {
        return {
          text: this.singleTransaction.fail_reason ? this.singleTransaction.fail_reason : "Rejected",
          icon: "ri-close-circle-fill",
          class: "rejected",
        };
      }
      if (this.singleTransaction.verified) {
        return {
          text: "Finalized",
          icon: "ri-check-double-line",
          class: "verified",
        };
      } else if (this.singleTransaction.commited) {
        return {
          text: "Committed",
          icon: "ri-check-line",
          class: "committed",
        };
      } else {
        return {
          text: "In progress",
          icon: "ri-loader-5-line",
          class: "inProgress",
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
        case "Swap":
          return {
            type: "Pair Swap",
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
        case "MintNFT":
          return {
            type: "Mint NFT",
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
            type: this.singleTransaction.tx.type.toString(),
            showAddress: true,
            modal: false,
          };
      }
    },
    tokenSymbol(): TokenSymbol | undefined {
      if (!this.isFeeTransaction && this.singleTransaction.tx.priority_op) {
        return this.singleTransaction.tx.priority_op.token as TokenSymbol;
      }
      if (this.singleTransaction.tx.type === "WithdrawNFT") {
        return this.singleTransaction.tx.token as TokenSymbol;
      }
      if (typeof this.singleTransaction.tx.feeToken === "number") {
        return this.$accessor.tokens.getTokenByID(this.singleTransaction.tx.feeToken)!.symbol as TokenSymbol;
      }
      if (this.singleTransaction.tx.priority_op) {
        return this.singleTransaction.tx.priority_op.token as TokenSymbol;
      }
      return this.singleTransaction.tx.token as TokenSymbol;
    },
    isMintNFT(): boolean {
      return this.singleTransaction.tx?.type === "MintNFT";
    },
    isNFT(): boolean {
      if (this.isMintNFT) {
        return true;
      }
      return utils.isNFT(this.tokenSymbol as TokenSymbol);
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
    isSameAddress(address: Address): boolean {
      return String(address).toLowerCase() === this.walletAddressFull.toLowerCase();
    },
    getTimeAgo(time: string): string {
      return moment(time).tz("UTC").fromNow();
    },
    getFormattedAmount({ tx: { type, priority_op, amount, fee } }: ZkInTx): string {
      let finalAmount = "0";
      if (this.isMintNFT || this.isFeeTransaction) {
        finalAmount = fee;
      } else if (type === "Deposit" && priority_op) {
        finalAmount = priority_op.amount;
      } else {
        finalAmount = amount;
      }
      return zkUtils.handleFormatToken(this.tokenSymbol as TokenSymbol, finalAmount) || "";
    },
    getAddressName(address: string): string {
      address = address ? String(address).toLowerCase() : "";
      const contactFromStore = this.$accessor.contacts.getByAddress(address);
      return contactFromStore ? contactFromStore.name : address.replace(address.slice(6, address.length - 3), "...");
    },
    getTransactionExplorerLink(transaction: ZkInTx): string {
      return (transaction.tx.type === "Deposit" ? `${APP_ETH_BLOCK_EXPLORER}/tx` : `${APP_ZKSYNC_BLOCK_EXPLORER}/transactions`) + `/${transaction.hash}`;
    },
    async getWithdrawalTx() {
      const singleTx = this.singleTransaction;
      if (singleTx && (singleTx.tx.type === "Withdraw" || singleTx.tx.type === "WithdrawNFT")) {
        const txFromStore = this.$accessor.transaction.getWithdrawalTx(singleTx.hash);
        if (txFromStore) {
          this.ethTx = `${APP_ETH_BLOCK_EXPLORER}/tx/${txFromStore}`;
        } else {
          const syncProvider = walletData.get().syncProvider;
          const ethTx = await syncProvider!.getEthTxForWithdrawal(singleTx.hash);
          if (ethTx) {
            this.ethTx = `${APP_ETH_BLOCK_EXPLORER}/tx/${ethTx}`;
            this.$accessor.transaction.setWithdrawalTx({ tx: singleTx.hash, ethTx });
          }
        }
      }
    },
    copy(value: string) {
      zkUtils.copy(value);
    },
  },
});
</script>
