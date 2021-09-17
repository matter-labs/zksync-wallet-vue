<template>
  <i-layout class="defaultLayout">
    <block-logging-in-loader />
    <transition name="fade">
      <div v-if="!loggingIn && loggedIn">
        <block-header ref="header" />
        <i-layout-content class="layoutContent">
          <sign-pubkey-modal />
          <div class="routerContainer">
            <transition name="fade" mode="out-in">
              <nuxt />
            </transition>
          </div>
        </i-layout-content>
        <block-footer class="desktopOnly" />
      </div>
    </transition>
  </i-layout>
</template>

<script lang="ts">
import Vue from "vue";
import SignPubkeyModal from "@/blocks/modals/SignPubkey.vue";
import theme from "matter-dapp-ui/utils/theme";

export default Vue.extend({
  components: {
    SignPubkeyModal,
  },
  computed: {
    loggingIn() {
      return this.$store.getters["zk-onboard/onboardStatus"] === "connecting" || this.$store.getters["zk-onboard/restoringSession"];
    },
    loggedIn() {
      return this.$store.getters["zk-onboard/onboardStatus"] === "authorized";
    },
  },
  mounted() {
    this.$inkline.config.variant = theme.getUserTheme();
    this.$store.dispatch("zk-provider/requestProvider");
  },
});
</script>
