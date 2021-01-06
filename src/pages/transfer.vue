<template>
  <transaction :from-route="fromRoute" type="transfer" />
</template>

<script>
import Transaction from "@/blocks/Transaction";
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
