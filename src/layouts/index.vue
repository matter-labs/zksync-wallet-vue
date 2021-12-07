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
import SentyMixin from "./sentry.mixin";
import { GIT_REVISION_SHORT } from "@/utils/config";

export default Vue.extend({
  mixins: [SentyMixin],
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
