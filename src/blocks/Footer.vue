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
          <i-badge v-if="version" variant="secondary" class="outline-white _margin-left-1 system-info">
            <i-popover size="sm" class="system-env-popover" :trigger="['hover', 'click']">
              <strong class="version">v.{{ version }}<sup v-if="isBeta" class="beta _text-danger">BETA</sup></strong>
              <template slot="header">Environment details</template>
              <template slot="body">
                <span class="env-details">
                  <i class="ri-npmjs-fill" />
                  zksync v.{{ zkLibVersion }}
                </span>
                <span class="env-details">
                  <i class="ri-reserved-fill" />
                  zkSync API <code class="_padding-y-0">{{ zkApiBase }}</code>
                </span>
              </template>
            </i-popover>
            <a :href="githubLink" class="revision _background-gray-40" target="_blank">
              <i class="ri-github-fill" />
              {{ revision }}
            </a>
            <small class="network">{{ netName }}</small>
            <span class="separator">|</span>
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
import { APP_ZKSYNC_BLOCK_EXPLORER, GIT_REVISION_SHORT, VERSION, ZK_API_BASE, ZK_IS_BETA, ZK_LIB_VERSION, ZK_NETWORK } from "@/plugins/build";
import utils from "@/plugins/utils";
import Vue from "vue";

export default Vue.extend({
  computed: {
    blockExplorerLink(): string {
      return APP_ZKSYNC_BLOCK_EXPLORER;
    },
    netName(): string {
      return ZK_NETWORK;
    },
    isBeta(): boolean {
      return ZK_IS_BETA;
    },
    zkLibVersion(): string {
      return ZK_LIB_VERSION;
    },
    version(): string {
      return VERSION;
    },
    githubLink(): string | undefined {
      return `https://github.com/matter-labs/zksync-wallet-vue/commit/${this.revision}`;
    },
    revision(): string {
      return GIT_REVISION_SHORT;
    },
    zkApiBase(): string {
      return ZK_API_BASE;
    },
  },
  methods: {
    toggleDarkMode(): void {
      utils.defineTheme(this.$inkline, true);
    },
  },
});
</script>
