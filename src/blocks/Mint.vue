<template>
  <div v-if="display" class="mintTokensContainer">
    <i-modal v-model="onlyTestNetModal" size="md">
      <template slot="header">Matter Labs Trial Token</template>
      <div>MLTT trial token is currently unavailable on mainnet. You can try it on our <a :href="mintLink">testnet</a> for now.</div>
    </i-modal>
    <template v-if="display">
      <i-button v-if="networkName !== 'mainnet'" block variant="secondary" size="lg" target="_blank" :href="mintLink">⚡ Get some trial tokens! ⚡</i-button>
      <i-button v-else block variant="secondary" size="lg" @click="onlyTestNetModal = true">⚡ Get some trial tokens! ⚡ </i-button>
    </template>
  </div>
</template>

<script lang="ts">
import { ETHER_NETWORK_NAME } from "@/plugins/build";
import Vue from "vue";

export default Vue.extend({
  name: "Mint",
  props: {
    display: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  data() {
    return {
      onlyTestNetModal: false,
    };
  },
  computed: {
    networkName(): string {
      return ETHER_NETWORK_NAME;
    },
    mintLink(): string {
      const links = {
        mainnet: "https://mint.zksync.dev",
        rinkeby: "https://mint.zksync.dev",
        ropsten: "https://mint-ropsten.zksync.dev",
      };
      if (links[ETHER_NETWORK_NAME]) {
        return links[ETHER_NETWORK_NAME];
      } else {
        return links.mainnet;
      }
    },
  },
});
</script>
