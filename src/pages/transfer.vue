<template>
  <transaction :from-route="fromRoute" type="transfer" />
</template>

<script>
import Transaction from "@/blocks/Transaction";
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
