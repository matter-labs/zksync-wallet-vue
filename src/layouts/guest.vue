<template>
  <i-layout class="indexLayout">
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
import utils, { capitalize } from "@/plugins/utils";

import { GIT_REVISION_SHORT } from "@/plugins/build";
import Vue from "vue";

export default Vue.extend({
  data() {
    return {
      version: GIT_REVISION_SHORT,
    };
  },
  head: {
    titleTemplate(titleChunk: string): string {
      const networkName = capitalize(this.$accessor.config.network.ethNetworkName);
      return titleChunk?.length ? `${titleChunk} | ${networkName}` : networkName;
    },
  },
  mounted() {
    utils.defineTheme(this.$inkline, false);
  },
});
</script>
