<template>
  <div class="maxHeightBlock" :style="{ height: `${value === true || (mobileOnly === true && screenWidth > 768) ? maxHeight : 0}px` }">
    <div ref="maxHeightContent" class="maxHeightContent">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: {
    value: {
      type: Boolean,
      required: false,
      default: false,
    },
    mobileOnly: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      maxHeight: 0,
      screenWidth: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
    };
  },
  updated() {
    this.$nextTick(() => {
      this.recalcHeight();
    });
  },
  mounted() {
    window.addEventListener("resize", this.recalcHeight);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.recalcHeight);
  },
  methods: {
    recalcHeight() {
      this.maxHeight = (this.$refs.maxHeightContent as HTMLElement).scrollHeight;
      this.screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    },
  },
});
</script>
