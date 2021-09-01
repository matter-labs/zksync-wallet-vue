<template>
  <div class="transactionPage depositPage dappPageWrapper">
    <block-transaction ref="transactionBlock" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  async asyncData({ store }) {
    await store.dispatch("zk-transaction/setType", "Deposit");
  },
  mounted() {
    this.$store.dispatch("zk-balances/requestEthereumBalances");
  },
});
</script>
