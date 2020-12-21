<template>
  <div class="indexLayout">
    <div class="routerContainer">
      <transition name="fade" mode="out-in">
        <nuxt />
      </transition>
    </div>
    <footer-component/>
  </div>
</template>

<script>
import footerComponent from "@/blocks/Footer.vue";
export default {
  components: {
    footerComponent,
  },
  computed: {
    screenLoader: function () {
      return this.$store.getters.getScreenLoader;
    },
  },
  watch: {
    $route: {
      immediate: true,
      handler(val, oldVal) {
        if (!oldVal) {
          return this.$nextTick(() => {
            document.documentElement.scrollTop = 0;
          });
        }
        if (val.path !== oldVal.path) {
          this.$nextTick(() => {
            let lastScroll = this.$store.getters["scroll/getLastScroll"];
            document.documentElement.scrollTop = lastScroll !== false ? lastScroll.y : 0;
          });
        }
      },
    },
  },
  mounted() {
    if (process.client) {
      window.history.scrollRestoration = "manual";
    }
    if(localStorage.getItem('colorTheme')) {
      this.$inkline.config.variant = localStorage.getItem('colorTheme');
    }
  },
};
</script>
