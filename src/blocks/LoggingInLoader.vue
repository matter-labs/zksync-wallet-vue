<template>
  <transition name="fade">
    <div v-if="loggingIn" class="loggingInLoader">
      <logo class="_margin-bottom-3" />
      <h1>Logging in{{ titlePostfix }}</h1>
      <div class="_margin-top-2 _margin-bottom-1" v-if="loadingHint">
        <p class="hint">
          <span>{{ loadingHint }}</span>
        </p>
      </div>
      <loader size="lg" />
      <i-button class="cancelButton" block variant="secondary" size="lg" @click="cancelLogin()">Cancel</i-button>
    </div>
  </transition>
</template>

<script>
import logo from "@/blocks/Logo.vue";

export default {
  components: {
    logo,
  },
  computed: {
    titlePostfix() {
      return this.selectedWallet ? ` with ${this.selectedWallet}` : "..";
    },
    loggingIn() {
      return this.$store.getters["account/loader"];
    },
    selectedWallet() {
      return this.$store.getters["account/selectedWallet"];
    },
    loadingHint() {
      return this.$store.getters["account/loadingHint"];
    },
  },
  methods: {
    cancelLogin() {
      this.$store.dispatch("wallet/logout");
      this.$router.push("/");
    },
  },
};
</script>
