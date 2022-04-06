<template>
  <block-transactions />
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  mounted() {
    this.$analytics.track("visit_history");
  },
});
</script>
