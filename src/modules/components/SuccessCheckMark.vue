<template>
  <div class="successCheckMark"></div>
</template>

<script>
import lottie from "lottie-web";
import SuccessCheckMark from "../plugins/lottie/SuccessCheckMark.json";

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
        animationData: SuccessCheckMark,
      });
    },
  },
};
</script>
