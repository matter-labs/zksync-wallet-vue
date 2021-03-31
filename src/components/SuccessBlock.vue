<template>
  <div class="successBlock tileBlock">
    <div class="tileHeadline h3">
      <span>{{ headline }}</span>
    </div>
    <checkmark />
    <slot />
    <a :href="txLink" v-if="txLink" class="_display-block _text-center _margin-top-1" target="_blank"> Link to the transaction <i class="ri-external-link-line"></i> </a>
    <div v-if="recipient" class="infoBlockItem smaller _margin-top-2">
      <div class="amount">
        <span>Recipient:</span>
        <span v-if="isOwnAddress(recipient.address)" class="secondaryText">Own account</span>
        <span v-else-if="recipient.name" class="secondaryText">{{ recipient.name }}</span>
      </div>
      <wallet-address :wallet="recipient.address" />
    </div>
    <div class="infoBlockItem _margin-top-1" v-if="amount">
      <div class="headline">Amount:</div>
      <div class="amount">
        <span class="tokenSymbol">{{ amount.token.symbol }}</span>
        {{ amount.amount | formatToken(amount.token.symbol) }}
        <span class="secondaryText">
          {{ amount.amount | formatUsdAmount(amount.token.tokenPrice, amount.token.symbol) }}
        </span>
      </div>
    </div>
    <div class="infoBlockItem smaller _margin-top-1" v-if="fee">
      <div class="headline">Fee:</div>
      <div class="amount">
        <span class="tokenSymbol">{{ fee.token.symbol }}</span>
        {{ fee.amount | formatToken(fee.token.symbol) }}
        <span class="secondaryText">
          {{ fee.amount | formatUsdAmount(fee.token.tokenPrice, fee.token.symbol) }}
        </span>
      </div>
    </div>
    <i-button block size="lg" variant="secondary" class="_margin-top-2" @click="$emit('continue')" v-if="continueBtnFunction">Ok</i-button>
    <i-button block size="lg" variant="secondary" class="_margin-top-2" :to="continueBtnLink" v-else>Ok</i-button>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Address } from "@/plugins/types";
import Checkmark from "@/components/Checkmark.vue";
import WalletAddress from "@/components/walletAddress.vue";

export default Vue.extend({
  props: {
    type: {
      type: String,
      default: "",
      required: false,
    },
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
    continueBtnFunction: {
      type: Boolean,
      default: false,
      required: false,
    },
    recipient: {
      type: Object,
      required: false,
    },
    amount: {
      type: Object,
      required: false,
    },
    fee: {
      type: Object,
      required: false,
    },
  },
  components: {
    Checkmark,
    WalletAddress,
  },
  computed: {
    ownAddress: function (): Address {
      return this.$store.getters["account/address"];
    },
  },
  methods: {
    isOwnAddress: function (address: Address): boolean {
      return this.ownAddress.toLowerCase() === address.toLowerCase();
    },
  },
});
</script>
