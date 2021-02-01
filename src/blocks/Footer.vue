<template>
  <footer class="_padding-y-1 _padding-x-0 _margin-x-auto mainFooter">
    <div class="_display-flex _flex-direction-row  container _align-items-center _justify-content-space-between ">
      <i-row class="_margin-y-1 _hidden-md-and-up">
        <i-badge v-if="version" variant="secondary" class="outline-white _margin-left-1">
          v.{{ version }} | <a href="https://uptime.com/s/zksync" target="_blank">uptime</a>
        </i-badge>
      </i-row>
      <i-row center class="linksRow _margin-0 _margin-md-top-1 _flex-nowrap _text-nowrap">
        <div class="_padding-1-2 _padding-md-x-1 _padding-left-0">
          <a target="_blank" class="footer-link link" href="//zksync.io/faq/intro.html">Docs</a>
        </div>
        <div class="_padding-1-2 _padding-md-x-1">
          <a target="_blank" class="footer-link" href="https://zksync.io/legal/terms.html">Terms</a>
        </div>
        <div class="_padding-1-2 _padding-md-x-1">
          <a target="_blank" class="footer-link" href="//zksync.io/contact.html">Contact</a>
        </div>
        <div class="_padding-1-2 _padding-md-x-1">
          <span class="badge">|</span>
        </div>
        <div class="_padding-1-2 _padding-md-x-1">
          <a target="_blank" class="footer-link" :href="`${blockExplorerLink}`">zkScan</a>
        </div>
        <div class="_padding-1-2 _padding-md-x-1">
          <a target="_blank" class="footer-link" href="https://link.zksync.io">zkLink</a>
        </div>        
      </i-row>
      <i-row center class="_text-nowrap _align-items-center _margin-0">
        <div class="_padding-1-2 _padding-md-x-1 _hidden-sm-and-down">
          <i-badge v-if="version" variant="secondary" class="outline-white _margin-left-1">
            v.{{ version }} | <a href="https://uptime.com/s/zksync" target="_blank">uptime</a>
          </i-badge>
        </div>

        <i-button block size="lg" circle class="floating-on-mobile" @click="toggleDarkMode">
          <i-icon icon="light"/>
        </i-button>
      </i-row>
    </div>
  </footer>
</template>

<script lang="ts">
import Vue from 'vue';
import { GIT_REVISION_SHORT } from "@/plugins/build";
import { APP_ZK_SCAN } from "@/plugins/build";

export default Vue.extend({
  data() {
    return {
      version: GIT_REVISION_SHORT,
    };
  },
  computed: {
    blockExplorerLink: function(): string {
      return APP_ZK_SCAN;
    },
  },
  methods: {
    toggleDarkMode() {
      // @ts-ignore: Unreachable code error
      this.$inkline.config.variant = this.$inkline.config.variant === "light" ? "dark" : "light";
      // @ts-ignore: Unreachable code error
      localStorage.setItem("colorTheme", this.$inkline.config.variant);
    },
  },
});
</script>
