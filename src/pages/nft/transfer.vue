<template>
  <transaction :from-route="fromRoute" type="nft-transfer" />
</template>

<script lang="ts">
import Context from "@nuxt/types";
import Vue from "vue";
import { Route } from "vue-router/types";

export default Vue.extend({
  asyncData({ from, app }: Context.Context): { fromRoute: Route } {
    if (from) {
      // @ts-ignore
      app.$accessor.setPreviousRoute({ path: from.path, query: from.query, params: from.params });
    }
    return {
      fromRoute: from,
    };
  },
});
</script>
