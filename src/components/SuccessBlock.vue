<template>
  <div class="successBlock tileBlock">
    <div class="tileHeadline h3">
      <span>{{ headline }}</span>
    </div>
    <checkmark />
    <slot />
    <a v-if="txLink" :href="txLink" class="_display-block _text-center _margin-top-1" target="_blank"> Link to the transaction <v-icon name="ri-external-link-line"></v-icon> </a>
    <div v-if="recipient" class="infoBlockItem smaller _margin-top-2">
      <div class="amount">
        <span>Recipient:</span>
        <span v-if="isOwnAddress(recipient.address)" class="secondaryText">Own account</span>
        <span v-else-if="recipient.name" class="secondaryText">{{ recipient.name }}</span>
      </div>
      <wallet-address :wallet="recipient.address" />
    </div>
    <div v-if="amount" class="infoBlockItem _margin-top-1">
      <div class="headline">Amount:</div>
      <div class="amount">
        <span class="tokenSymbol">{{ amount.token.symbol }}</span>
        {{ amount.amount | formatToken(amount.token.symbol) }}
        <span class="secondaryText">
          <token-price :symbol="amount.token.symbol" :amount="amount.amount" />
        </span>
      </div>
    </div>
    <div v-if="fee" class="infoBlockItem smaller _margin-top-1">
      <div class="headline">Fee:</div>
      <div class="amount">
        <span class="tokenSymbol">{{ fee.token.symbol }}</span>
        {{ fee.amount | formatToken(fee.token.symbol) }}
        <span class="secondaryText">
          <token-price :symbol="fee.token.symbol" :amount="fee.amount" />
        </span>
      </div>
    </div>
    <slot name="custom" />
    <i-button v-if="!noBtn && continueBtnFunction" block size="lg" variant="secondary" class="_margin-top-2" @click="$emit('continue')">
      {{ continueBtnText ? continueBtnText : "Ok" }}
    </i-button>
    <i-button v-else-if="!noBtn" block size="lg" variant="secondary" class="_margin-top-2" :to="continueBtnLink">Ok</i-button>
  </div>
</template>

<script lang="ts">
import { Address } from "zksync/build/types";
import Vue from "vue";

export default Vue.extend({
  props: {
    headline: {
      type: String,
      default: "",
      required: false,
    },
    txLink: {
      type: String,
      default: "",
      required: false,
    },
    continueBtnLink: {
      type: String,
      default: "/account",
      required: false,
    },
    noBtn: {
      type: Boolean,
      default: false,
      required: false,
    },
    continueBtnFunction: {
      type: Boolean,
      default: false,
      required: false,
    },
    continueBtnText: {
      type: String,
      default: "",
      required: false,
    },
    recipient: {
      type: Object,
      required: false,
      default: undefined,
    },
    amount: {
      type: Object,
      required: false,
      default: undefined,
    },
    fee: {
      type: Object,
      required: false,
      default: undefined,
    },
  },
  computed: {
    ownAddress(): Address {
      return this.$accessor.account.address || "";
    },
  },
  methods: {
    isOwnAddress(address: Address): boolean {
      return this.ownAddress.toLowerCase() === address.toLowerCase();
    },
  },
});
</script>
