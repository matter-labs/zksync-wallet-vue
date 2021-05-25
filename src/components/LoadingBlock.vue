<template>
  <div class="loadingBlock tileBlock">
    <div class="tileHeadline h3">{{ headline }}</div>
    <div class="loadingBlockContent">
      <slot />
    </div>
    <div class="spinnerContainer _padding-y-2">
      <loader />
    </div>
  </div>
</template>

<script type="ts">
import Vue from "vue";

export default Vue.extend({
  name: "LoadingBlock",
  props: {
    headline: {
      type: String,
      default: "",
      required: false,
    }
  }
});
</script>
