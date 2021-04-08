<template>
  <transition name="fade">
    <div v-if="loggingIn" class="loggingInLoader">
      <logo class="_margin-bottom-3" :is-zk-sync-logo="false" />
      <h1>Logging in {{ selectedWallet ? `with ${selectedWallet}` : "" }}</h1>
      <p v-if="hintText" class="hint">
        <span>{{ hintText }}</span>
      </p>
      <div class="_margin-top-2"></div>
      <loader size="lg" />
      <i-button class="cancelButton" block variant="secondary" size="lg" @click="cancelLogin()">Cancel</i-button>
    </div>
  </transition>
</template>

<script lang="ts">
import logo from "@/blocks/Logo.vue";
import Vue from "vue";

export default Vue.extend({
  components: {
    logo,
  },
  computed: {
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
  methods: {
    cancelLogin(): void {
      this.$accessor.wallet.logout();
      this.$router.push("/");
    },
  },
});
</script>
