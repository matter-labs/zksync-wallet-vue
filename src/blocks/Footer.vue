<template>
  <i-layout-footer class="_padding-top-1 mainFooter">
    <div class="_display-flex _flex-direction-row container _align-items-center _justify-content-space-between">
      <i-row class="_margin-md-y-1 _hidden-md-and-up">
        <i-badge v-if="version" variant="secondary" class="outline-white _margin-left-1">
          v.{{ version }} |
          <a href="https://uptime.com/s/zksync" target="_blank">uptime</a>
        </i-badge>
      </i-row>
      <i-row center class="linksRow _margin-0 _margin-md-top-1 _flex-nowrap _text-nowrap">
        <div class="_padding-1-2 _padding-md-x-1 _padding-left-0">
          <a target="_blank" class="footer-link link" href="https://zksync.io/faq/intro.html">Docs</a>
        </div>
        <div class="_padding-1-2 _padding-md-x-1">
          <a target="_blank" class="footer-link" href="https://zksync.io/legal/terms.html">Terms</a>
        </div>
        <div class="_padding-1-2 _padding-md-x-1">
          <a target="_blank" class="footer-link" href="https://zksync.io/contact.html">Contact</a>
        </div>
        <div class="_padding-1-2 _padding-md-x-1">
          <span class="badge">|</span>
        </div>
        <div class="_padding-1-2 _padding-md-x-1">
          <a target="_blank" class="footer-link" :href="blockExplorerLink">zkScan</a>
        </div>
      </i-row>
      <i-row center class="_text-nowrap _align-items-center _margin-0">
        <div class="_padding-1-2 _padding-md-x-1 _hidden-sm-and-down">
          <i-badge v-if="version" variant="secondary" class="outline-white _margin-left-1">
            <strong>v.{{ version }}</strong
            >:{{ revision }} |
            <a href="https://uptime.com/s/zksync" target="_blank">uptime</a>
          </i-badge>
        </div>

        <i-button block size="lg" circle class="floating-on-mobile" @click="toggleDarkMode">
          <i-icon icon="light" />
        </i-button>
      </i-row>
    </div>
  </i-layout-footer>
</template>

<script lang="ts">
import { APP_ZK_SCAN, GIT_REVISION_SHORT, VERSION } from "@/plugins/build";
import utils from "@/plugins/utils";
import Vue from "vue";

export default Vue.extend({
  computed: {
    blockExplorerLink(): string {
      return APP_ZK_SCAN;
    },
    version(): string {
      return VERSION;
    },
    revision(): string {
      return GIT_REVISION_SHORT;
    },
  },
  methods: {
    toggleDarkMode(): void {
      utils.defineTheme(this.$inkline, true);
    },
  },
});
</script>
