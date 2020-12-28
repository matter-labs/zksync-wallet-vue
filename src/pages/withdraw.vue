<template>
    <transaction :fromRoute="fromRoute" type="withdraw" />
</template>

<script>
import Transaction from "@/blocks/Transaction.vue";
export default {
  asyncData({ from }) {
    return {
      fromRoute: from
    }
  },
  components: {
    Transaction,
  },
};
</script>
