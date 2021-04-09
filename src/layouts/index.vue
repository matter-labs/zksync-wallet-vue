<template>
  <div class="indexLayout">
    <logging-in-loader />
    <header-component />
    <div class="routerContainer">
      <transition name="fade" mode="out-in">
        <nuxt />
      </transition>
    </div>
    <footer-component />
  </div>
</template>

<script lang="ts">
import headerComponent from "@/blocks/IndexHeader.vue";
import footerComponent from "@/blocks/Footer.vue";
import loggingInLoader from "@/blocks/LoggingInLoader.vue";
import { GIT_REVISION_SHORT } from "@/plugins/build";
import Vue from "vue";

export default Vue.extend({
  components: {
    headerComponent,
    loggingInLoader,
    footerComponent,
  },
  data() {
    return {
      version: GIT_REVISION_SHORT,
    };
  },
  mounted() {
    if (localStorage.getItem("colorTheme")) {
      this.$inkline.config.variant = localStorage.getItem("colorTheme") as "light" | "dark";
    } else {
      localStorage.setItem("colorTheme", this.$inkline.config.variant);
    }
  },
  methods: {
    toggleDarkMode() {
      this.$inkline.config.variant = this.$inkline.config.variant === "light" ? "dark" : "light";
      localStorage.setItem("colorTheme", this.$inkline.config.variant);
    },
  },
});
</script>
