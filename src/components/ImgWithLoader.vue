<template>
  <div class="imgWithLoader" @click="$emit('click')">
    <transition name="fadeFast">
      <loader v-if="!imgLoaded" :size="loaderSize" />
    </transition>
    <img :class="{ loaded: imgLoaded }" :src="src" :alt="alt" @load="imgLoaded = true" @loadstart="imgLoaded = false" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: {
    loaderSize: {
      type: String,
      default: "xs",
      required: false,
    },
    src: {
      type: String,
      default: "",
      required: true,
    },
    alt: {
      type: String,
      default: "",
      required: true,
    },
  },
  data() {
    return {
      imgLoaded: false,
    };
  },
});
</script>

<style lang="scss" scoped>
.imgWithLoader {
  position: relative;
  width: 100%;
  height: 100%;

  .loaderContainer {
    z-index: 1;
    position: absolute;
  }

  img {
    width: 100%;
    height: 100%;
    opacity: 0.8;
    filter: brightness(0.5);
    object-fit: contain;
    object-position: center;
    transition: $transition1;
    transition-property: opacity, filter;
    will-change: opacity, filter;

    &.loaded {
      opacity: 1;
      filter: brightness(1);
    }
  }
}
</style>
