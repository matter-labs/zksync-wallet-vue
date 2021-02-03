<template>
  <div class="animatedCheckmark"></div>
</template>

<script>
import successCheckmark from "@/plugins/successCheckmark.json";
import lottie from "lottie-web";

export default {
  mounted() {
    this.loadAnimation();
  },
  methods: {
    loadAnimation() {
      return lottie.loadAnimation({
        container: this.$el,
        autoplay: true,
        loop: false,
        width: "200px",
        height: "200px",
        animationData: successCheckmark,
      });
    },
  },
};
</script>
