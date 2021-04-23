<template>
  <transactions />
</template>

<script lang="ts">
import transactions from "@/blocks/Transactions.vue";
import Vue from "vue";

export default Vue.extend({
  components: {
    transactions,
  },
});
</script>
