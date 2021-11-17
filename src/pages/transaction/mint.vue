<template>
  <div class="transactionPage mintPage dappPageWrapper">
    <block-transaction ref="transactionBlock" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  created() {
    this.$store.dispatch("zk-transaction/setType", "Mint");
  },
});
</script>
