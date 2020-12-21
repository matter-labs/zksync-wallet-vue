<template>
    <transaction type="transfer" />
</template>

<script>
import Transaction from "@/blocks/Transaction.vue";
export default {
  head() {
    return {
      title: 'Transfer'
    }
  },
  components: {
    Transaction,
  },
};
</script>
