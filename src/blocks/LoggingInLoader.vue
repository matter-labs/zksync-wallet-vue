<template>
    <transition name="fade">
        <div v-if="loggingIn" class="loggingInLoader">
            <logo class="_margin-bottom-3" />
            <h1>Logging in {{selectedWallet ? `with ${selectedWallet}` : ''}}</h1>
            <p class="hint" v-if="loadingHint">
              <span v-if="loadingHint==='followInstructions'">Follow the instructions in your wallet</span>
              <span v-else-if="loadingHint==='loadingData'">Getting wallet information</span>
            </p>
            <div class="_margin-top-2"></div>
            <div class="loaderSpinner">Loading...</div>
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
    loggingIn: function() {
      return this.$store.getters['account/loader'];
    },
    selectedWallet: function () {
      return this.$store.getters["account/selectedWallet"];
    },
    loadingHint: function () {
      return this.$store.getters["account/loadingHint"];
    },
  },
  methods: {
    cancelLogin: function () {
      this.$store.dispatch("wallet/logout");
      this.$router.push("/");
    },
  },
};
</script>
