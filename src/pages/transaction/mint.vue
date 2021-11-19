<template>
  <div class="transactionPage mintPage dappPageWrapper">
    <block-transaction ref="transactionBlock" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  created() {
    if (this.$store.getters["zk-provider/network"] === "mainnet") {
      return this.$router.push("/account");
    }
    this.$store.dispatch("zk-transaction/setType", "Mint");
  },
});
</script>
