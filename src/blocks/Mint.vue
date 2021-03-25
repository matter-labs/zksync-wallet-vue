<template>
  <div class="mintTokensContainer">
    <i-modal v-model="onlyTestNetModal" size="md">
      <template slot="header">Matter Labs Trial Token</template>
      <div>
        <p>MLTT trial token is currently unavailable on mainnet. You can try it on our <a href="https://rinkeby.zksync.io/">Rinkeby testnet</a> for now.</p>
      </div>
    </i-modal>
    <div v-if="display">
      <i-button v-if="networkName!=='mainnet'" block variant="secondary" size="lg" target="_blank" href="///https://zkmint.zksync.io/">⚡ Get some trial tokens! ⚡ </i-button>
      <i-button v-else block variant="secondary" size="lg" @click="onlyTestNetModal=true">⚡ Get some trial tokens! ⚡ </i-button>
    </div>
  </div>
</template>

<script>
import { ETHER_NETWORK_NAME } from "@/plugins/build";

export default {
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
    networkName() {
      return ETHER_NETWORK_NAME;
    },
  },
};
</script>

<style lang="scss" scoped>
.mintTokensContainer {
  width: 100%;
}
</style>
