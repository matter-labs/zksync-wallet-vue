<template>
  <transaction :from-route="fromRoute" type="transfer" />
</template>

<script lang="ts">
import Transaction from "@/blocks/Transaction.vue";
import Context from "@nuxt/types";
import Vue from "vue";
import { Route } from "vue-router/types";

export default Vue.extend({
  components: {
    Transaction,
  },
  asyncData({ from }: Context.Context): { fromRoute: Route } {
    return {
      fromRoute: from,
    };
  },
});
</script>
