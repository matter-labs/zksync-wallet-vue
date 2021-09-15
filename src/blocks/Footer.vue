<template>
  <div>
    <block-logging-in-loader />
    <block-modals-footer-modal v-model="footerModal" />
    <block-modals-environment />
    <network-switch />
    <i-layout-footer class="mainFooter">
      <div class="_display-flex _flex-direction-row container _align-items-center _justify-content-space-between _justify-content_mobile-space-around">
        <i-row center class="linksRow _margin-0 _margin-md-top-1 _flex-nowrap _text-nowrap">
          <div class="_padding-1-2 _padding-md-x-1 _padding-left-0">
            <a target="_blank" class="footer-link" href="https://zksync.io/faq/intro.html">Docs</a>
          </div>
          <div class="_padding-1-2 _padding-md-x-1">
            <a target="_blank" class="footer-link" href="https://zksync.io/legal/terms.html">Terms</a>
          </div>
          <div class="_padding-1-2 _padding-md-x-1">
            <a target="_blank" class="footer-link" href="https://zksync.io/contact.html">Contact</a>
          </div>
          <div class="_padding-1-2 _padding-md-x-1">
            <span class="dividerLine">|</span>
          </div>
          <div class="_padding-1-2 _padding-md-x-1">
            <a target="_blank" class="footer-link" :href="blockExplorerLink">zkScan</a>
          </div>
        </i-row>
        <i-row center class="_text-nowrap _align-items-center _margin-0">
          <div class="_display-flex _align-items-center _padding-1-2 _padding-md-top-2 _padding-md-bottom-1 _padding-right-1 _hidden-sm-and-down">
            <block-system-info />
            <span class="_padding-x-1 dividerLine">|</span>
            <a href="https://uptime.com/s/zksync" class="uptime-link" target="_blank">uptime</a>
          </div>
          <i-button v-if="!isProduction" size="md" circle class="_margin-right-1 _hidden-sm-and-down" outline variant="dark" @click="openNetworkSwitchModal">
            <v-icon name="co-ethereum" scale="1" />
          </i-button>
          <i-button size="md" circle class="_hidden-sm-and-down" outline variant="dark" @click="toggleDarkMode">
            <v-icon v-if="isDarkTheme" name="ri-sun-fill" scale="1" />
            <v-icon v-else name="ri-moon-fill" scale="1" />
          </i-button>
          <i-button class="_hidden-md-and-up floating-on-mobile" size="md" circle outline variant="dark" @click="footerModal = !footerModal">
            <v-icon name="ri-more-2-fill" />
          </i-button>
        </i-row>
      </div>
    </i-layout-footer>
  </div>
</template>

<script lang="ts">
import { VERSION, ETHER_PRODUCTION } from "@/plugins/build";
import utils from "@/plugins/utils";
import Vue from "vue";
import NetworkSwitch from "@/blocks/modals/NetworkSwitch.vue";

export default Vue.extend({
  name: "Footer",
  components: {
    NetworkSwitch,
  },
  data() {
    return {
      footerModal: false,
    };
  },
  computed: {
    blockExplorerLink(): string {
      return this.$accessor.config.network.zkSyncBlockExplorerUrl;
    },
    version(): string {
      return VERSION;
    },
    isProduction(): boolean {
      return ETHER_PRODUCTION;
    },
    isDarkTheme(): boolean {
      return utils.defineTheme(this.$inkline) === "dark";
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
