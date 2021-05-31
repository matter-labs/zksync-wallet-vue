<template>
  <transaction :from-route="fromRoute" type="withdraw" />
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  asyncData({ from, app }) {
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
