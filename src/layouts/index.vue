<template>
  <div class="indexLayout">
    <logging-in-loader />
    <header-component />
    <div class="routerContainer">
      <transition name="fade" mode="out-in">
        <nuxt />
      </transition>
    </div>
    <div class="mobileOnly" style="height: 95px"></div>
    <footer-component />
  </div>
</template>

<script lang="ts">
import footerComponent from "@/blocks/Footer.vue";
import headerComponent from "@/blocks/IndexHeader.vue";
import loggingInLoader from "@/blocks/LoggingInLoader.vue";

import { GIT_REVISION_SHORT } from "@/plugins/build";
import utils from "@/plugins/utils";
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
    utils.defineTheme(this.$inkline, false);
  },
});
</script>
