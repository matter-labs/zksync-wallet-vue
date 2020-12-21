<template>
    <transactions />
</template>

<script>
import transactions from "@/blocks/Transactions.vue";
export default {
  head() {
    return {
      title: 'Transactions'
    }
  },
  components: {
    transactions,
  },
};
</script>
