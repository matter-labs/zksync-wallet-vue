<template>
  <div class="walletPage dappPageWrapper">
    <block-modals-argent-nft-warning />
    <block-nft-balances class="_margin-top-1" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { warningCanceledKey } from "@/blocks/modals/ArgentNftWarning.vue";

export default Vue.extend({
  mounted() {
    if (this.$store.getters["zk-onboard/selectedWallet"] === "Argent" && !localStorage.getItem(warningCanceledKey)) {
      this.$accessor.openModal("ArgentNftWarning");
    }
    this.$analytics.track("visit_nft");
  },
});
</script>
