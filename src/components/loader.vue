<template>
  <div class="loaderContainer" :class="`size-${size}`">
    <div class="loaderSpinner">Loading...</div>
  </div>
</template>

<script>
export default {
  props: {
    size: {
      type: String,
      default: "md",
      required: false,
    },
  },
};
</script>
