<template>
  <div class="transactionPage mintNFTPage dappPageWrapper">
    <block-transaction ref="transactionBlock" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  created() {
    this.$store.dispatch("zk-transaction/setType", "MintNFT");
  },
});
</script>
