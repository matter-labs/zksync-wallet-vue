<template>
  <div class="walletPage">
    <balances />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import balances from "@/blocks/Balances.vue";

export default Vue.extend({
  components: {
    balances,
  },
});
</script>
