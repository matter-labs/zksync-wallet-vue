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
  asyncData({ from, store, redirect }) {
    if (store.getters["wallet/isAccountLocked"]) {
      redirect("/account/unlock");
    }
    return {
      fromRoute: from,
    };
  },
};
</script>
