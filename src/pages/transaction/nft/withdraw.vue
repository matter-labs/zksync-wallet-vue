<template>
  <div class="transactionPage withdrawNFTPage dappPageWrapper">
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
    this.$store.dispatch("zk-transaction/setType", "WithdrawNFT");
  },
  mounted() {
    this.$analytics.track("visit_withdraw_nft");
  },
});
</script>
