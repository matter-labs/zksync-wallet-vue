<template>
  <i-layout class="defaultLayout">
    <block-header ref="header" />
    <i-layout-content v-if="!loggingIn && loggedIn" class="layoutContent">
      <sign-pubkey-modal />
      <div class="routerContainer">
        <transition name="fade" mode="out-in">
          <nuxt />
        </transition>
      </div>
    </i-layout-content>
    <block-footer class="desktopOnly" />
  </i-layout>
</template>

<script lang="ts">
import utils, { capitalize } from "@/plugins/utils";
import Vue from "vue";
import SignPubkeyModal from "@/blocks/modals/SignPubkey.vue";
export default Vue.extend({
  components: {
    SignPubkeyModal,
  },
  head: {
    titleTemplate(titleChunk: string): string {
      const networkName = capitalize(this.$accessor.config.network.ethNetworkName);
      return titleChunk?.length ? `${titleChunk} | ${networkName}` : networkName;
    },
  },
  computed: {
    loggingIn() {
      return this.$accessor.provider.loader;
    },
    loggedIn() {
      return this.$accessor.provider.loggedIn;
    },
  },
  mounted() {
    utils.defineTheme(this.$inkline, false);
  },
});
</script>
