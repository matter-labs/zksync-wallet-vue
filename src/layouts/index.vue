<template>
  <i-layout class="indexLayout">
    <logging-in-loader />
    <header-component />
    <i-layout-content class="routerContainer">
      <transition name="fade" mode="out-in">
        <nuxt />
      </transition>
    </i-layout-content>
    <footer-component />
  </i-layout>
</template>

<script lang="ts">
import headerComponent from "@/blocks/IndexHeader.vue";
import footerComponent from "@/blocks/Footer.vue";
import loggingInLoader from "@/blocks/LoggingInLoader.vue";

import { GIT_REVISION_SHORT } from "@/utils/config";
import Vue from "vue";
import theme from "matter-dapp-ui/utils/theme";

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
    this.$inkline.config.variant = theme.getUserTheme();
  },
});
</script>
