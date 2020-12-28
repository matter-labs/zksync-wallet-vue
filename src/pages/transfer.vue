<template>
  <transaction :fromRoute="fromRoute" type="transfer" />
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
