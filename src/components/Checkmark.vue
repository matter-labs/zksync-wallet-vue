<template>
  <div class="animatedCheckmark" />
</template>

<script lang="ts">
import successCheckmark from "@matterlabs/zksync-nuxt-core/utils/lottie/SuccessCheckMark.json";
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
      } as AnimationConfigWithData<"svg">);
    },
  },
});
</script>
<style lang="scss">
.animatedCheckmark {
  display: block;
  width: 100%;
  height: max-content;
  margin: 0 auto;
  text-align: center;

  svg {
    width: 150px !important;
    height: 150px !important;
  }
}
</style>
