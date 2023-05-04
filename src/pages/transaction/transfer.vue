<template>
  <div class="transactionPage transferPage dappPageWrapper">
    <block-transaction ref="transactionBlock" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  created() {
    this.$store.dispatch("zk-transaction/setType", "Transfer");
  },
  mounted() {
    this.$analytics.track("visit_transfer");
  },
});
</script>
