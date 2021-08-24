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
import Vue from "vue";
import SignPubkeyModal from "@/blocks/modals/SignPubkey.vue";
export default Vue.extend({
  components: {
    SignPubkeyModal,
  },
  computed: {
    loggingIn() {
      return this.$store.getters["zk-onboard/onboardStatus"] === "connecting";
    },
    loggedIn() {
      return this.$store.getters["zk-onboard/onboardStatus"] === "authorized";
    },
  },
  mounted() {
    // utils.defineTheme(this.$inkline, false);
    this.$store.dispatch("zk-provider/requestProvider");
  },
});
</script>
