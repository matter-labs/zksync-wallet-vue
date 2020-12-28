<template>
  <div class="indexLayout">
    <logging-in-loader />
    <div class="routerContainer">
      <transition name="fade" mode="out-in">
        <nuxt />
      </transition>
    </div>
    <cookie-component />
    <footer-component/>
<!--    <footer>-->
<!--      <i-container>-->
<!--        <i-row center class="_margin-top-1">-->
<!--          <div class="_padding-x-1">-->
<!--            <a target="_blank" class="footer-link link" href="//zksync.io/faq/intro.html">Docs</a>-->
<!--          </div>-->
<!--          <div class="_padding-x-1">-->
<!--            <a target="_blank" class="footer-link" href="https://zksync.io/legal/terms.html">Terms of Use</a>-->
<!--          </div>-->
<!--          <div class="_padding-x-1">-->
<!--            <a target="_blank" class="footer-link" href="https://zksync.io/legal/privacy.html">Privacy Policy</a>-->
<!--          </div>-->
<!--          <div class="_padding-x-1">-->
<!--            <a target="_blank" class="footer-link" href="//zksync.io/contact.html">Contact</a>-->
<!--          </div>-->
<!--        </i-row>-->
<!--
<!--        <i-row center>-->
<!--          <i-button block size="lg" circle @click="toggleDarkMode">-->
<!--            <i-icon icon="light"/>-->
<!--          </i-button>-->
<!--        </i-row>-->

<!--      </i-container>-->
<!--    </footer>-->

  </div>
</template>

<script>
import { GIT_REVISION_SHORT } from "@/plugins/build";
import cookieComponent from "@/blocks/Cookie.vue";
import footerComponent from "@/blocks/Footer.vue";
import loggingInLoader from "@/blocks/LoggingInLoader.vue";
export default {
  components: {
    cookieComponent,
    loggingInLoader,
    footerComponent,
  },
  data() {
    return {
      version: GIT_REVISION_SHORT,
    };
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
    if (localStorage.getItem("colorTheme")) {
      this.$inkline.config.variant = localStorage.getItem("colorTheme");
    }
  },
  methods: {
    toggleDarkMode() {
      this.$inkline.config.variant = this.$inkline.config.variant === "light" ? "dark" : "light";
      localStorage.setItem("colorTheme", this.$inkline.config.variant);
    },
  },
};
</script>
