<template>
  <div class="footerModalContainer">
    <i-modal v-model="modal" size="md">
      <template slot="header">
        <b>Information</b>
      </template>
      <template slot="default">
        <a class="modalFooterBtn big" href="https://zksync.io/faq/intro.html" target="_blank">
          <v-icon name="ri-book-2-line" />
          <span>Docs</span>
        </a>
        <a class="modalFooterBtn big" href="https://zksync.io/legal/terms.html" target="_blank">
          <v-icon name="ri-profile-line" />
          <span>Terms</span>
        </a>
        <a class="modalFooterBtn big" href="https://zksync.io/contact.html" target="_blank">
          <v-icon name="ri-contacts-book-line" />
          <span>Contact</span>
        </a>
        <a class="modalFooterBtn big" :href="blockExplorerLink" target="_blank">
          <v-icon name="ri-external-link-line" />
          <span>zkScan</span>
        </a>
        <a class="modalFooterBtn big" href="https://uptime.com/s/zksync" target="_blank">
          <v-icon name="ri-contacts-book-line" />
          <span>Uptime</span>
        </a>
      </template>
      <template slot="footer">
        <div class="_display-flex _justify-content-space-between">
          <i-badge v-if="version" variant="secondary" class="outline-white system-info">
            <i-popover size="sm" class="system-env-popover" :trigger="['hover', 'click']">
              <strong class="version">v.{{ version }}<sup v-if="isBeta" class="beta _text-danger">BETA</sup></strong>
              <template slot="header">Environment details</template>
              <template slot="body">
                <span class="env-details">
                  <v-icon name="ri-npmjs-fill" />
                  zksync v.{{ zkLibVersion }}
                </span>
                <span class="env-details">
                  <v-icon name="ri-reserved-fill" />
                  zkSync API <code class="_padding-y-0">{{ zkApiBase }}</code>
                </span>
                <span class="env-details">
                  <v-icon name="ri-reserved-fill" />
                  Ethereum env <code class="_padding-y-0">{{ netName }}</code>
                </span>
              </template>
            </i-popover>
            <a :href="githubLink" class="revision _background-gray-40" target="_blank">
              <v-icon name="ri-github-fill" />
              {{ revision }}
            </a>
          </i-badge>
          <i-button block size="md" circle @click="toggleDarkMode">
            <i-icon icon="light" />
          </i-button>
        </div>
      </template>
    </i-modal>
  </div>
</template>

<script lang="ts">
import { APP_ZKSYNC_BLOCK_EXPLORER, GIT_REVISION_SHORT, VERSION, ZK_API_BASE, ZK_IS_BETA, ZK_LIB_VERSION, ZK_NETWORK } from "@/plugins/build";
import utils from "@/plugins/utils";
import Vue from "vue";

export default Vue.extend({
  props: {
    value: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  computed: {
    modal: {
      get(): boolean {
        return this.value;
      },
      set(val: boolean): void {
        this.$emit("input", val);
      },
    },
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
