<template>
  <div class="transactionPage mintPage dappPageWrapper">
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
    this.$store.dispatch("zk-transaction/setType", "Mint");
    if (this.$store.getters["zk-provider/network"] === "mainnet") {
      return this.$router.push("/account");
    }
  },
  mounted() {
    this.$analytics.track("visit_mint");
  },
});
</script>
