<template>
  <div class="_display-flex _flex-direction-row _align-items-center headerWrapper">
    <!-- // v-if="isZkSyncLogo" class="projectLogo _margin-right-1-2" -->
    <template v-if="isZkSyncLogo">
      <img :src="zkWalletLogoSrc" alt="zkWallet" class="zkwallet-logo" />
    </template>
    <template v-else>
      <img :src="zkWalletLogoSrc" alt="zkWallet" class="zkwallet-logo" />
    </template>
    <block-network-badge />
  </div>
</template>

<script lang="ts">
import { ZK_NETWORK, ETHER_PRODUCTION } from "@/plugins/build";
import utils from "@/plugins/utils";
import Vue from "vue";

export default Vue.extend({
  name: "Logo",
  props: {
    isZkSyncLogo: {
      default: true,
      required: false,
      type: Boolean,
    },
  },
  computed: {
    zkWalletLogoSrc(): string {
      const prefix = utils.defineTheme(this.$inkline, false) === "light" ? "" : "_alt";
      return require(`@/assets/imgs/logos/rif_logo${prefix}.svg`);
    },
    isMainnet(): boolean {
      return ETHER_PRODUCTION;
    },
    network(): string {
      return ZK_NETWORK;
    },
  },
});
</script>
