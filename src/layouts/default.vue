<template>
  <div class="defaultLayout">
    <logging-in-loader />
    <div v-if="!loggingIn && loggedIn" class="layoutContent">
      <div class="headerSpace mobileOnly"></div>
      <header-component ref="header" />
      <div class="routerContainer">
        <transition name="fade" mode="out-in">
          <nuxt />
        </transition>
      </div>
      <footer-component />
    </div>
  </div>
</template>

<script type="ts">
import footerComponent from "@/blocks/Footer.vue";
import headerComponent from "@/blocks/Header.vue";
import loggingInLoader from "@/blocks/LoggingInLoader.vue";
import utils from "@/plugins/utils";
import Vue from "vue";

export default Vue.extend({
  components: {
    headerComponent,
    footerComponent,
    loggingInLoader,
  },
  computed: {
    loggingIn(){
      return this.$accessor.account.loader;
    },
    loggedIn(){
      return this.$accessor.account.loggedIn;
    },
  },
  mounted(){
    utils.defineTheme(this.$inkline, false);
  }
});
</script>
