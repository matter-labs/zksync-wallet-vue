<template>
  <i-layout class="defaultLayout">
    <block-logging-in-loader />
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
import utils from "@/plugins/utils";
import Vue from "vue";
import SignPubkeyModal from "@/blocks/modals/SignPubkey.vue";
export default Vue.extend({
  components: {
    SignPubkeyModal,
  },
  computed: {
    loggingIn() {
      return this.$accessor.account.loader;
    },
    loggedIn() {
      return this.$accessor.account.loggedIn;
    },
  },
  mounted() {
    utils.defineTheme(this.$inkline, false);
  },
});
</script>
