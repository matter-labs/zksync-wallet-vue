<template>
  <div class="indexLayout">
    <screen-loader />
    <div class="routerContainer">
      <transition name="fade" mode="out-in">
        <nuxt />
      </transition>
    </div>
    <cookie-component />
    <footer-component/>
  </div>
</template>

<script>
import footerComponent from "@/blocks/Footer.vue";
import cookieComponent from "@/blocks/Cookie.vue";
import screenLoader from "@/blocks/ScreenLoader.vue";
export default {
  components: {
    footerComponent,
    cookieComponent,
    screenLoader
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
