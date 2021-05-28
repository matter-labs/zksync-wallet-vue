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
          <block-system-info />
          <i-button block size="md" circle @click="toggleDarkMode">
            <i-icon icon="light" />
          </i-button>
        </div>
      </template>
    </i-modal>
  </div>
</template>

<script lang="ts">
import { APP_ZKSYNC_BLOCK_EXPLORER } from "@/plugins/build";
import utils from "@/plugins/utils";
import Vue from "vue";

export default Vue.extend({
  components: {},
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
  },
  methods: {
    toggleDarkMode(): void {
      utils.defineTheme(this.$inkline, true);
    },
  },
});
</script>
