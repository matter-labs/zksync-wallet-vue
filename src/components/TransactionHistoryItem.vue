<template>
  <div class="transaction">
    <div class="status">
      <i-tooltip placement="right">
        <v-icon :name="transactionStatus.icon" :class="transactionStatus.class" />
        <template slot="body">{{ transactionStatus.text }}</template>
      </i-tooltip>
    </div>
    <div class="mainInfo" :class="{ noInfo: isNFT || isSwap }">
      <i-tooltip>
        <div class="createdAt">{{ timeAgo }}</div>
        <template slot="body">{{ transaction.createdAt | formatDateTime }}</template>
      </i-tooltip>
      <div v-if="!isNFT && !isSwap" :class="{ small: smallAmountText }" class="amount">{{ amount | parseBigNumberish(tokenSymbol) }}</div>
      <div v-if="!isMintNFT && !isSwap" class="tokenSymbol">
        <span v-if="isNFT && tokenSymbol">NFT-</span>
        <div v-else-if="isNFT && transaction.tx && transaction.tx.contentHash" class="nft">
          <span class="contentHash">{{ transaction.tx.contentHash }}</span>
          <i-tooltip placement="left" trigger="click" class="copyContentHash" @click.native="copy(transaction.tx.contentHash)">
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
      <nuxt-link v-else-if="transactionTypeData.showAddress && displayedAddress" class="actionValue" :to="`/contacts/${displayedAddress}`">
        {{ getAddressName(displayedAddress) }}
      </nuxt-link>
      <a
        v-if="ethTxHash"
        :href="config.ethereumNetwork.explorer + 'tx/' + ethTxHash"
        target="_blank"
        class="linkText"
        @click.passive="$analytics.track('view_transaction_in_blockexplorer')"
      >
        Ethereum Transaction
        <v-icon name="ri-external-link-line" scale="0.8" />
      </a>
    </div>
    <a
      v-if="transactionExplorerLink"
      class="button -md -secondary -link externalLink"
      target="_blank"
      :href="transactionExplorerLink"
      @click.passive="$analytics.track('view_transaction_in_zkscan')"
    >
      <v-icon name="ri-external-link-line" scale="0.8" />
    </a>
  </div>
</template>

<script lang="ts">
import { utils } from "zksync";

import moment from "moment-timezone";
import Vue, { PropOptions } from "vue";
import { BigNumberish } from "@ethersproject/bignumber";
import { Address, TokenSymbol, ApiTransaction } from "zksync/build/types";
import { Token, ZkContact, ZkConfig } from "@matterlabs/zksync-nuxt-core/types";
import { copyToClipboard } from "@matterlabs/zksync-nuxt-core/utils";
import { getAddress } from "ethers/lib/utils";

let getTimeAgoInterval: ReturnType<typeof setInterval>;
export default Vue.extend({
  props: {
    transaction: {
      type: Object,
      default: () => {},
      required: true,
    } as PropOptions<ApiTransaction>,
  },
  data() {
    return {
      timeAgo: "",
      ethTxHash: "",
      config: <ZkConfig>this.$store.getters["zk-onboard/config"],
    };
  },
  computed: {
    isFeeTransaction(): boolean {
      return (
        this.transaction.op.type === "ChangePubKey" ||
        this.transaction.op.type === "FullExit" ||
        this.transaction.op.type === "Close" ||
        (this.transaction.op.type === "Transfer" && this.transaction.op.amount === "0" && this.transaction.op.from === this.transaction.op.to)
      );
    },
    walletAddressFull(): Address {
      return this.$store.getters["zk-account/address"];
    },
    displayedAddress(): Address {
      const op = this.transaction.op;
      if (op.type === "Transfer") {
        if (this.isSameAddress(op.to)) {
          return op.from;
        } else {
          return op.to;
        }
      } else if (op.type === "Deposit" || op.type === "Withdraw" || op.type === "WithdrawNFT") {
        return op.to;
      } else if (op.type === "MintNFT") {
        return op.recipient;
      } else if (op.type === "ForcedExit") {
        return op.target;
      } else if (op.type === "Close") {
        return op.account;
      } else if (op.type === "Swap") {
        if (this.isSameAddress(op.orders[0].recipient)) {
          return op.orders[1].recipient;
        } else {
          return op.orders[0].recipient;
        }
      }
      return "";
    },
    transactionStatus(): { text: string; icon: string; class: string } {
      if (this.transaction.failReason) {
        return {
          text: this.transaction.failReason ? this.transaction.failReason : "Rejected",
          icon: "ri-close-circle-fill",
          class: "rejected",
        };
      }
      if (this.transaction.status === "finalized") {
        return {
          text: "Verified",
          icon: "ri-check-double-line",
          class: "verified",
        };
      } else if (this.transaction.status === "committed") {
        return {
          text: "Committed",
          icon: "ri-check-line",
          class: "committed",
        };
      } else {
        return {
          text: "Initiated",
          icon: "ri-loader-5-line",
          class: "inProgress",
        };
      }
    },
    transactionTypeData(): { type: string; showAddress: boolean; modal: false | { icon: string; key: string } } {
      switch (this.transaction.op.type) {
        case "Withdraw":
        case "WithdrawNFT":
          return {
            type: "Withdrawn to:",
            showAddress: true,
            modal: false,
          };
        case "ForcedExit":
          return {
            type: "Forced Exited to:",
            showAddress: true,
            modal: false,
          };
        case "FullExit":
          return {
            type: "Full Exited to:",
            showAddress: true,
            modal: false,
          };
        case "Close":
          return {
            type: "Close Account",
            showAddress: false,
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
            if (this.isSameAddress(this.transaction.op.to)) {
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
            // @ts-ignore
            type: this.transaction.op.type.toString(),
            showAddress: true,
            modal: false,
          };
      }
    },
    tokenSymbol(): TokenSymbol | number {
      let tokenID = 0;
      switch (this.transaction.op.type) {
        case "Withdraw":
        case "WithdrawNFT":
        case "ForcedExit":
        case "Transfer":
          tokenID = this.transaction.op.token;
          break;
        case "Deposit":
        case "FullExit":
          tokenID = this.transaction.op.tokenId;
          break;
        case "Close":
        case "Swap":
          return "";
        case "ChangePubKey":
        case "MintNFT":
          tokenID = this.transaction.op.feeToken;
          break;
      }
      const token: Token = this.$store.getters["zk-tokens/zkTokenByID"](tokenID);
      if (token) {
        return token.symbol;
      }
      return tokenID;
    },
    isMintNFT(): boolean {
      return this.transaction.op.type === "MintNFT";
    },
    isSwap(): boolean {
      return this.transaction.op.type === "Swap";
    },
    isNFT(): boolean {
      if (this.isMintNFT || typeof this.tokenSymbol === "number") {
        return true;
      }
      return utils.isNFT(this.tokenSymbol);
    },
    amount(): BigNumberish | undefined {
      switch (this.transaction.op.type) {
        case "Withdraw":
        case "Transfer":
        case "Deposit":
          if (!this.isNFT) {
            if (this.transaction.op.type === "Transfer" && this.isFeeTransaction) {
              return this.transaction.op.fee;
            }
            return this.transaction.op.amount;
          } else {
            return undefined;
          }
        case "WithdrawNFT":
        case "FullExit":
        case "Close":
        case "Swap":
          return undefined;
        case "ForcedExit":
        case "ChangePubKey":
        case "MintNFT":
          return this.transaction.op.fee;
      }
      return undefined;
    },
    transactionExplorerLink(): string {
      if (this.transaction.op.type === "Deposit") {
        if (this.ethTxHash) {
          return `${this.config.zkSyncNetwork.explorer}explorer/transactions/${this.ethTxHash}`;
        }
        return "";
      }
      return `${this.config.zkSyncNetwork.explorer}explorer/transactions/${this.transaction.txHash}`;
    },
    smallAmountText(): boolean {
      if (this.isNFT || !this.amount || !this.tokenSymbol) {
        return false;
      }
      const amount = this.$options.filters?.parseBigNumberish(this.amount, this.tokenSymbol);
      if (!amount) {
        return false;
      }
      if (`${amount} ${this.tokenSymbol}`.length > 15) {
        return true;
      }
      return false;
    },
  },
  mounted() {
    this.timeAgo = this.getTimeAgo(this.transaction.createdAt);
    getTimeAgoInterval = setInterval(() => {
      if (!this.transaction) {
        return clearInterval(getTimeAgoInterval);
      }
      this.timeAgo = this.getTimeAgo(this.transaction.createdAt);
    }, 30000);
    this.getWithdrawalTx();
  },
  beforeDestroy() {
    clearInterval(getTimeAgoInterval);
  },
  methods: {
    isSameAddress(address: Address): boolean {
      return getAddress(address) === getAddress(this.walletAddressFull);
    },
    getTimeAgo(time?: string): string {
      if (!time) {
        return "";
      }
      return moment(time).tz("UTC").fromNow();
    },
    getAddressName(address: string): string {
      const contactFromStore: ZkContact = this.$store.getters["zk-contacts/contactByAddress"](address);
      return contactFromStore && !contactFromStore.deleted ? contactFromStore.name : address.replace(address.slice(6, address.length - 3), "...");
    },
    async getWithdrawalTx() {
      const tx = this.transaction;
      if (tx.op.type === "Withdraw" || tx.op.type === "WithdrawNFT" || tx.op.type === "ForcedExit") {
        const withdrawalEthTxHash = await this.$store.dispatch("zk-history/getWithdrawalEthTxHash", tx.txHash);
        if (withdrawalEthTxHash) {
          this.ethTxHash = withdrawalEthTxHash;
        }
      } else if (tx.op.type === "Deposit" || tx.op.type === "FullExit") {
        this.ethTxHash = tx.op.ethHash;
      }
    },
    copy(value: string) {
      copyToClipboard(value);
    },
  },
});
</script>
