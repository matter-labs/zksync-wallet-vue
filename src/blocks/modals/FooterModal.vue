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
          <v-icon name="ri-wifi-line" />
          <span>Uptime</span>
        </a>
        <div class="modalFooterBtn big" @click="$accessor.openModal('environment')">
          <v-icon name="ri-reserved-line" />
          <span>Environment</span>
        </div>
      </template>
      <template slot="footer">
        <div class="_display-flex _justify-content-space-between">
          <block-system-info />
          <network-switch />
          <div class="_display-flex">
            <i-button v-if="!isProduction" size="md" circle class="_margin-right-1 _margin-0" block @click="openNetworkSwitchModal">
              <v-icon name="co-ethereum" scale="1" />
            </i-button>
            <i-button block size="md" circle class="_margin-0" @click="toggleDarkMode">
              <v-icon v-if="isDarkTheme" name="ri-sun-fill" />
              <v-icon v-else name="ri-moon-fill" />
            </i-button>
          </div>
        </div>
      </template>
    </i-modal>
  </div>
</template>

<script lang="ts">
import { ETHER_PRODUCTION } from "@/plugins/build";
import utils from "@/plugins/utils";
import Vue from "vue";
import NetworkSwitch from "@/blocks/modals/NetworkSwitch.vue";

export default Vue.extend({
  components: {
    NetworkSwitch,
  },
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
      return this.$accessor.config.network.zkSyncBlockExplorerUrl;
    },
    isDarkTheme(): boolean {
      return utils.defineTheme(this.$inkline) === "dark";
    },
    isProduction(): boolean {
      return ETHER_PRODUCTION;
    },
  },
  methods: {
    toggleDarkMode(): void {
      utils.defineTheme(this.$inkline, true);
    },
    openNetworkSwitchModal() {
      return this.$accessor.openModal("NetworkSwitch");
    },
  },
});
</script>
