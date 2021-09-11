<template>
  <div class="transactionPage transferPage dappPageWrapper">
    <block-transaction ref="transactionBlock" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  async asyncData({ store }) {
    await store.dispatch("zk-transaction/setType", "Transfer");
    return {};
  },
});
</script>
