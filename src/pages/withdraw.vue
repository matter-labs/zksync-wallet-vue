<template>
  <transaction :from-route="fromRoute" type="withdraw" />
</template>

<script>
import Transaction from "@/blocks/Transaction.vue";

/**
 * @property fromRoute
 */
export default {
  components: {
    Transaction,
  },
  asyncData({ from }) {
    return {
      fromRoute: from,
    };
  },
};
</script>
