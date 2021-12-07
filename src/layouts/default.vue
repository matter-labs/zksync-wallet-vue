<template>
  <i-layout class="defaultLayout">
    <block-logging-in-loader />
    <block-modals-wrong-network />
    <block-modals-requesting-provider-error />
    <transition name="fade">
      <div v-if="!loggingIn && loggedIn">
        <block-header ref="header" />
        <i-layout-content class="layoutContent">
          <block-modals-sign-pubkey />
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
import theme from "@matterlabs/zksync-nuxt-core/utils/theme";
import SentyMixin from "./sentry.mixin";

export default Vue.extend({
  mixins: [SentyMixin],
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
