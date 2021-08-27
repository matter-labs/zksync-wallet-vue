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
import utils from "@/plugins/utils";

import { GIT_REVISION_SHORT } from "@/plugins/build";
import Vue from "vue";

export default Vue.extend({
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
