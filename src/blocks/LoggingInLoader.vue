<template>
  <transition name="fade">
    <div v-if="loggingIn || loggedInAnimation" class="loggingInLoader">
      <logo class="_margin-bottom-3" :is-zk-sync-logo="false" />
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
    loggedIn() {
      return this.$accessor.account.loggedIn;
    },
    loggingIn() {
      return this.$accessor.account.loader;
    },
    hintText(): string {
      if (this.$accessor.account.loadingHint === "followInstructions") {
        return "Follow the instructions in your wallet";
      }
      if (this.$accessor.account.loadingHint === "loadingData") {
        return "Getting wallet information";
      }
      return this.$accessor.account.loadingHint;
    },
    selectedWallet() {
      return this.$accessor.account.selectedWallet;
    },
  },
  watch: {
    loggedIn(val) {
      console.log("val changed", val);
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
    cancelLogin(): void {
      this.$accessor.wallet.logout(true);
      this.loggedInAnimation = false;
      clearTimeout(loggedInAnimationTimeout);
      if (this.$route.path !== "/") {
        this.$router.push("/");
      }
    },
  },
});
</script>
