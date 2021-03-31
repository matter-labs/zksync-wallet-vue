<template>
  <div class="defaultLayout">
    <logging-in-loader />
    <div v-if="!loggingIn && loggedIn">
      <header-component ref="header" />
      <div class="routerContainer">
        <transition name="fade" mode="out-in">
          <nuxt />
        </transition>
      </div>
      <footer-component />
    </div>
  </div>
</template>

<script type="ts">
import footerComponent from "@/blocks/Footer.vue";
import headerComponent from "@/blocks/Header.vue";
import loggingInLoader from "@/blocks/LoggingInLoader.vue";
import Vue from "vue";

export default Vue.extend({
  components: {
    headerComponent,
    footerComponent,
    loggingInLoader,
  },
  computed: {
    loggingIn() {
      return this.$store.getters["account/loader"];
    },
    loggedIn() {
      return this.$store.getters["account/loggedIn"];
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
            const lastScroll = this.$store.getters["scroll/getLastScroll"];
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
    if (localStorage.getItem("colorTheme")) {
      this.$inkline.config.variant = localStorage.getItem("colorTheme");
    }
  },
});
</script>
