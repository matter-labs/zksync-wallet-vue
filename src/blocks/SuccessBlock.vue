<template>
  <div class="successBlock tileBlock">
    <div class="tileHeadline h3">
      <span>{{ headline }}</span>
    </div>
    <checkmark />
    <a v-if="txLink" :href="txLink" class="_display-block _text-center _margin-top-1" target="_blank">Link to the transaction <v-icon name="ri-external-link-line"></v-icon></a>
    <div v-if="activeTransaction.address" class="infoBlockItem smaller _margin-top-2">
      <div class="amount">
        <span>Recipient:</span>
        <span v-if="isOwnAddress" class="secondaryText">Own account</span>
        <span v-else-if="openedContact" class="secondaryText">{{ openedContact.name }}</span>
      </div>
      <wallet-address :wallet="activeTransaction.address" />
    </div>
    <div v-if="activeTransaction.amount" class="infoBlockItem _margin-top-1">
      <div class="headline">Amount:</div>
      <div class="amount">
        <span v-if="typeof activeTransaction.token === 'string'">
          <span class="tokenSymbol">{{ activeTransaction.token }}</span>
          {{ activeTransaction.amount | parseBigNumberish(activeTransaction.token) }}
          <span class="secondaryText">
            <token-price :symbol="activeTransaction.token" :amount="activeTransaction.amount" />
          </span>
        </span>
        <span v-else>NFT-{{ activeTransaction.token }}</span>
      </div>
    </div>
    <div v-if="activeTransaction.fee" class="infoBlockItem smaller _margin-top-1">
      <div class="headline">Fee:</div>
      <div class="amount">
        <span class="tokenSymbol">{{ activeTransaction.feeToken }}</span>
        {{ activeTransaction.fee | parseBigNumberish(activeTransaction.feeToken) }}
        <span class="secondaryText">
          <token-price :symbol="activeTransaction.feeToken" :amount="activeTransaction.fee" />
        </span>
      </div>
    </div>
    <i-button data-cy="success_block_ok_button" block size="lg" variant="secondary" class="_margin-top-2" :to="continueBtnLink">Ok</i-button>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { getAddress } from "ethers/lib/utils";
import { ZkActiveTransaction, ZkContact, ZkConfig } from "matter-dapp-ui/types";

export default Vue.extend({
  props: {
    headline: {
      type: String,
      default: "",
      required: false,
    },
  },
  computed: {
    activeTransaction(): ZkActiveTransaction {
      return this.$store.getters["zk-transaction/activeTransaction"];
    },
    config(): ZkConfig {
      return this.$store.getters["zk-onboard/config"];
    },
    txLink(): string | undefined {
      if (!this.activeTransaction.txHash) {
        return undefined;
      }
      switch (this.activeTransaction.type) {
        case "Mint":
        case "Allowance":
        case "Deposit":
          return this.config.ethereumNetwork.explorer + "tx/" + this.activeTransaction.txHash;

        default:
          return this.config.zkSyncNetwork.explorer + "tx/" + this.activeTransaction.txHash;
      }
    },
    isOwnAddress(): boolean {
      return getAddress(this.$store.getters["zk-account/address"]) === getAddress(this.activeTransaction.address || "");
    },
    openedContact(): ZkContact {
      return this.$store.getters["zk-contacts/contactByAddress"](this.activeTransaction.address);
    },
    continueBtnLink(): string {
      switch (this.activeTransaction.type) {
        case "MintNFT":
        case "TransferNFT":
        case "WithdrawNFT":
          return "/account/nft";

        default:
          return "/account";
      }
    },
  },
});
</script>
