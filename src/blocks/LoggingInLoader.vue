<template>
  <transition name="fade">
    <div v-if="loggingIn && !loggingInScreenDelay" class="loggingInLoader">
      <block-logo class="_margin-bottom-3" />
      <h1>Logging in {{ selectedWallet ? `with ${selectedWallet}` : "" }}</h1>
      <transition-group v-if="hintText" tag="div" name="slide-vertical-fade" class="hint">
        <div :key="hintText">{{ hintText }}</div>
      </transition-group>
      <loader size="lg" class="_margin-y-2" />
      <i-button class="cancelButton _padding-x-2" size="sm" variant="secondary" @click="cancelLogin()">Cancel</i-button>
    </div>
  </transition>
</template>

<script lang="ts">
import Vue from "vue";
import { Route } from "vue-router";

let loggedInAnimationTimeout: ReturnType<typeof setTimeout>;
export default Vue.extend({
  name: "LoggingInLoader",
  data() {
    return {
      loggingInScreenDelay: false,
    };
  },
  computed: {
    loggingIn(): boolean {
      return (
        this.$store.getters["zk-onboard/onboardStatus"] === "connecting" ||
        this.$store.getters["zk-onboard/restoringSession"]
      );
    },
    loggedIn(): boolean {
      return this.$store.getters["zk-onboard/onboardStatus"] === "authorized";
    },
    hintText(): string {
      return this.$store.getters["zk-onboard/loadingHint"];
    },
    selectedWallet(): unknown {
      return this.$store.getters["zk-onboard/selectedWallet"];
    },
  },
  watch: {
    loggingIn(val: unknown) {
      clearTimeout(loggedInAnimationTimeout);
      if (val === true) {
        this.loggingInScreenDelay = true;
        loggedInAnimationTimeout = setTimeout(() => {
          this.loggingInScreenDelay = false;
        }, 150);
      } else {
        this.loggingInScreenDelay = false;
      }
    },
  },
  methods: {
    async cancelLogin(): Promise<Route> {
      await this.$store.dispatch("zk-account/logout");
      return this.$router.push("/");
    },
  },
});
</script>
