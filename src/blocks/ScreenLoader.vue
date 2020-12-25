<template>
    <transition name="fade">
        <div v-if="screenLoader" class="screenLoaderContainer">
            <h1>Logging in {{loggingInWith ? `with ${loggingInWith}` : ''}}</h1>
            <div class="loaderSpinner">Loading...</div>
            <i-button class="cancelButton" block variant="secondary" size="lg" @click="cancelLogin()">Cancel</i-button>
        </div>
    </transition>
</template>

<script>
let getNameInterval = false;
let intervalRemoveTimeout = false;
export default {
  data() {
    return {
      loggingInWith: false,
    };
  },
  computed: {
    screenLoader: function () {
      return this.$store.getters["getScreenLoader"];
    },
  },
  watch: {
    screenLoader(val) {
      if (val === true) {
        getNameInterval = setInterval(() => {
          this.loggingInWith = localStorage.getItem("selectedWallet");
        }, 50);
        intervalRemoveTimeout = setTimeout(() => {
          clearInterval(getNameInterval);
        }, 500);
      } else {
        clearInterval(getNameInterval);
        clearTimeout(intervalRemoveTimeout);
      }
    },
  },
  beforeDestroy() {
    clearInterval(getNameInterval);
    clearTimeout(intervalRemoveTimeout);
  },
  methods: {
    cancelLogin: function () {
      this.$store.dispatch("wallet/logout");
      this.$router.push("/");
      this.$store.commit("hideLoader");
    },
  },
};
</script>
