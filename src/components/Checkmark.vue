<template>
  <div class="animatedCheckmark" />
</template>

<script lang="ts">
import successCheckmark from "@/plugins/successCheckmark.json";
import lottie, { AnimationConfigWithData, AnimationItem } from "lottie-web";
import Vue from "vue";

export default Vue.extend({
  mounted() {
    this.loadAnimation();
  },
  methods: {
    loadAnimation(): AnimationItem {
      return lottie.loadAnimation({
        container: this.$el,
        autoplay: true,
        loop: false,
        width: "200px",
        height: "200px",
        animationData: successCheckmark,
      } as AnimationConfigWithData);
    },
  },
});
</script>
