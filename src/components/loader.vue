<template>
  <div class="loaderContainer" data-cy="core_loader_spinner" :class="`size-${size}`">
    <div class="loaderSpinner">Loading...</div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: {
    size: {
      type: String,
      default: "md",
      required: false,
    },
  },
});
</script>
