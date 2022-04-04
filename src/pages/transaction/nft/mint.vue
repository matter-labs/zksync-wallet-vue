<template>
  <div class="transactionPage mintNFTPage dappPageWrapper">
    <block-transaction :fromRoute="fromRoute" ref="transactionBlock" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  asyncData({ from }) {
    return {
      fromRoute: from,
    };
  },
  data() {
    return {
      fromRoute: undefined,
    }
  },
  created() {
    this.$store.dispatch("zk-transaction/setType", "MintNFT");
  },
  mounted() {
    this.$analytics.track("visit_mint_nft");
  },
});
</script>
