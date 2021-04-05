<template>
  <transition name="fade">
    <div v-if="loggingIn" class="loggingInLoader">
      <logo class="_margin-bottom-3" :is-zk-sync-logo="false" />
      <h1>Logging in {{ selectedWallet ? `with ${selectedWallet}` : "" }}</h1>
      <p v-if="loadingHint" class="hint">
        <span v-if="loadingHint === 'followInstructions'">Follow the instructions in your wallet</span>
        <span v-else-if="loadingHint === 'loadingData'">Getting wallet information</span>
      </p>
      <div class="_margin-top-2"></div>
      <loader size="lg" />
      <i-button class="cancelButton" block variant="secondary" size="lg" @click="cancelLogin()">Cancel</i-button>
    </div>
  </transition>
</template>

<script lang="ts">
import Vue from "vue";
import logo from "@/blocks/Logo.vue";

export default Vue.extend({
  components: {
    logo,
  },
  computed: {
    loggingIn(): boolean {
      return this.$store.getters["account/loader"];
    },
    selectedWallet(): string {
      return this.$store.getters["account/selectedWallet"];
    },
    loadingHint(): string {
      return this.$store.getters["account/loadingHint"];
    },
  },
  methods: {
    cancelLogin(): void {
      this.$store.dispatch("wallet/logout");
      this.$router.push("/");
    },
  },
});
</script>
