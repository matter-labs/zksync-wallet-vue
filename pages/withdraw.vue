<template>
    <transaction type="withdraw" />
</template>

<script>
import Transaction from "@/blocks/Transaction.vue";
export default {
  head() {
    return {
      title: 'Withdraw'
    }
  },
  components: {
    Transaction,
  },
};
</script>
