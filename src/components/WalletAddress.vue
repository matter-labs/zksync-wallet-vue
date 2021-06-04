<template>
  <div class="walletContainer">
    <user-img :wallet="wallet" @click="$emit('clickPicture')" />
    <span class="walletValue walletAddress">{{ wallet }}</span>
    <i-tooltip placement="left" trigger="click">
      <i class="copy" @click="copyAddress()"><v-icon name="ri-clipboard-line" /></i>
      <template slot="body">Copied!</template>
    </i-tooltip>
  </div>
</template>

<script lang="ts">
import Vue, { PropOptions } from "vue";
import { Address } from "zksync/build/types";
import utils from "@/plugins/utils";

export default Vue.extend({
  name: "WalletAddress",
  props: {
    wallet: {
      type: String,
      default: "",
      required: true,
    } as PropOptions<Address>,
  },
  methods: {
    copyAddress() {
      utils.copy(this.wallet);
    },
  },
});
</script>
