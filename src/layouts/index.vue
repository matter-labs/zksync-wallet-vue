<template>
  <i-layout class="indexLayout">
    <block-logging-in-loader />
    <block-index-header />
    <block-modals-wrong-network />
    <block-modals-requesting-provider-error />
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
import theme from "@matterlabs/zksync-nuxt-core/utils/theme";
import SentryMixin from "./sentry.mixin";
import AnalyticsMixin from "./analytics.mixin";

export default Vue.extend({
  mixins: [SentryMixin, AnalyticsMixin],
  mounted() {
    this.$inkline.config.variant = theme.getUserTheme();
  },
});
</script>
