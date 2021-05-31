<template>
  <div v-if="display" class="mintTokensContainer">
    <i-modal v-model="onlyTestNetModal" size="md">
      <template slot="header">Matter Labs Trial Token</template>
      <div>MLTT trial token is currently unavailable on mainnet. You can try it on our <a href="https://ropsten.zksync.io/">Ropsten testnet [beta]</a> for now.</div>
    </i-modal>
    <i-button-group v-if="display">
      <i-button v-if="networkName !== 'mainnet'" block variant="secondary" size="lg" target="_blank" href="https://mint-ropsten.zksync.dev">⚡ Get some trial tokens! ⚡ </i-button>
      <i-button v-else block variant="secondary" size="lg" @click="onlyTestNetModal = true">⚡ Get some trial tokens! ⚡ </i-button>
    </i-button-group>
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
  },
});
</script>
