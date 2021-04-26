<template>
  <footer class="_padding-top-1 mainFooter">
    <img class="zkSyncBootomLogo desktopOnly" src="@/assets/imgs/zkSync.svg" alt="zkSync" />
    <div class="_display-flex _flex-direction-row container _align-items-center _justify-content-space-between">
      <i-row class="_margin-md-y-1 _hidden-md-and-up">
        <i-badge v-if="version" variant="secondary" class="outline-white _margin-left-1">
          v.{{ version }} | <a href="https://uptime.com/s/zksync" target="_blank">uptime</a>
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
          <a target="_blank" class="footer-link" :href="`${blockExplorerLink}`">zkScan</a>
        </div>
      </i-row>
      <i-row center class="_margin-0 _margin-md-top-1 _flex-nowrap _text-nowrap badge outline-white -secondary _display-none">
        <a href="https://zksync.io" target="_blank" class="poweredBy">
          <logo />
          <span>Ecosystem</span>
        </a>
      </i-row>
      <i-row center class="_text-nowrap _align-items-center _margin-0">
        <div class="_padding-1-2 _padding-md-x-1 _hidden-sm-and-down">
          <i-badge v-if="version" variant="secondary" class="outline-white _margin-left-1">
            v.{{ version }} | <a href="https://uptime.com/s/zksync" target="_blank">uptime</a>
          </i-badge>
        </div>

        <i-button block size="lg" circle class="floating-on-mobile" @click="toggleDarkMode">
          <i-icon icon="light" />
        </i-button>
      </i-row>
    </div>
  </footer>
</template>

<script lang="ts">
import { GIT_REVISION_SHORT, APP_ZK_SCAN } from "@/plugins/build";
import Logo from "@/blocks/Logo.vue";
import utils from "@/plugins/utils";
import Vue from "vue";

export default Vue.extend({
  components: {
    Logo,
  },
  computed: {
    blockExplorerLink(): string {
      return APP_ZK_SCAN;
    },
    version(): string {
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
