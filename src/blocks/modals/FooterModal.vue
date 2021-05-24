<template>
  <div v-if="modal" class="footerModalContainer">
    <i-modal v-model="modal" size="md">
      <template slot="header">
        <b>Information</b>
      </template>
      <template slot="default">
        <a class="modalFooterBtn big" href="https://zksync.io/faq/intro.html" target="_blank">
          <i class="ri-book-2-line" />
          <span>Docs</span>
        </a>
        <a class="modalFooterBtn big" href="https://zksync.io/legal/terms.html" target="_blank">
          <i class="ri-profile-line" />
          <span>Terms</span>
        </a>
        <a class="modalFooterBtn big" href="https://zksync.io/contact.html" target="_blank">
          <i class="ri-contacts-book-line" />
          <span>Contact</span>
        </a>
        <a class="modalFooterBtn big" :href="blockExplorerLink" target="_blank">
          <i class="ri-external-link-line" />
          <span>zkScan</span>
        </a>
      </template>
      <template slot="footer">
        <div>v.{{ version }} | <a href="https://uptime.com/s/zksync" target="_blank">uptime</a></div>
        <i-button block size="lg" circle class="floating-on-mobile" @click="toggleDarkMode">
          <i-icon icon="light" />
        </i-button>
      </template>
    </i-modal>
  </div>
</template>

<script lang="ts">
import { GIT_REVISION_SHORT, APP_ZK_SCAN } from "@/plugins/build";
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
