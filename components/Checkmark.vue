<template>
    <div class="animtedCheckmark">

    </div>
</template>

<script>
import lottie from "lottie-web";
import successCheckmark from "@/plugins/successCheckmark.json";
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
