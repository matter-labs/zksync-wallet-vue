<template>
  <transition name="fade">
    <div v-if="loggingIn || loggedInAnimation" class="loggingInLoader">
      <logo class="_margin-bottom-3" :is-zk-sync-logo="true" />
      <h1>Logging in {{ selectedWallet ? `with ${selectedWallet}` : "" }}</h1>
      <transition-group v-if="hintText" tag="div" name="slide-vertical-fade" class="hint">
        <div v-if="!loggedInAnimation" :key="hintText">{{ hintText }}</div>
        <div v-else key="success" class="green">Wallet successfully connected!</div>
      </transition-group>
      <loader size="lg" class="_margin-y-2" />
      <i-button class="cancelButton _padding-x-2" size="sm" variant="secondary" @click="cancelLogin()">Cancel</i-button>
    </div>
  </transition>
</template>

<script lang="ts">
import logo from "@/blocks/Logo.vue";
import Vue from "vue";

let loggedInAnimationTimeout: ReturnType<typeof setTimeout>;
export default Vue.extend({
  name: "LoggingInLoader",
  components: {
    logo,
  },
  data() {
    return {
      loggedInAnimation: false,
    };
  },
  computed: {
    loggingIn() {
      return this.$store.getters["zk-onboard/onboardStatus"] === "connecting";
    },
    loggedIn() {
      return this.$store.getters["zk-onboard/onboardStatus"] === "connected";
    },
    hintText(): string {
      return this.$store.getters["zk-onboard/loadingHint"];
    },
    selectedWallet() {
      return this.$store.getters["zk-onboard/selectedWallet"];
    },
  },
  watch: {
    loggedIn(val) {
      clearTimeout(loggedInAnimationTimeout);
      this.loggedInAnimation = val;
      if (val === true) {
        loggedInAnimationTimeout = setTimeout(() => {
          this.loggedInAnimation = false;
        }, 550);
      }
    },
  },
  methods: {
    async cancelLogin() {
      await this.$store.dispatch("zk-account/logout");
      this.$router.push("/");
      this.loggedInAnimation = false;
      clearTimeout(loggedInAnimationTimeout);
    },
  },
});
</script>
