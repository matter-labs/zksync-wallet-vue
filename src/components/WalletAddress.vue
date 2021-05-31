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
      const elem = document.createElement("textarea");
      elem.style.position = "absolute";
      elem.style.left = -99999999 + "px";
      elem.style.top = -99999999 + "px";
      elem.value = this.wallet;
      document.body.appendChild(elem);
      elem.select();
      document.execCommand("copy");
      document.body.removeChild(elem);
    },
  },
});
</script>
