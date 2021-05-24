<template>
  <transaction :from-route="fromRoute" type="transfer" />
</template>

<script lang="ts">
import Context from "@nuxt/types";
import Vue from "vue";
import { Route } from "vue-router/types";

export default Vue.extend({
  asyncData({ from }: Context.Context): { fromRoute: Route } {
    return {
      fromRoute: from,
    };
  },
});
</script>
