<template>
  <i-layout class="indexLayout">
    <block-logging-in-loader />
    <block-index-header />
    <i-layout-content class="routerContainer">
      <transition name="fade" mode="out-in">
        <nuxt />
      </transition>
    </i-layout-content>
    <block-footer />
  </i-layout>
</template>

<script lang="ts">
import Vue from "vue";
import theme from "matter-dapp-module/utils/theme";
import SentryMixin from "./sentry.mixin";
import { GIT_REVISION_SHORT } from "@/utils/config";

export default Vue.extend({
  mixins: [SentryMixin],
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
