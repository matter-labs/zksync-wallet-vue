<template>
  <i-layout-footer class="mainFooter">
    <div class="_display-flex _flex-direction-row container _align-items-center _justify-content-space-between">
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
        <i-button size="md" circle class="floating-on-mobile" outline variant="dark" @click="toggleDarkMode">
          <v-icon v-if="isDarkTheme" name="ri-sun-fill" scale="1" />
          <v-icon v-else name="ri-moon-fill" scale="1" />
        </i-button>
      </i-row>
    </div>
  </i-layout-footer>
</template>

<script lang="ts">
import Vue from "vue";
import theme from "matter-dapp-ui/utils/theme";

export default Vue.extend({
  name: "Footer",
  data() {
    return {
      theme: theme.getUserTheme(),
    };
  },
  computed: {
    blockExplorerLink(): string {
      return this.$store.getters["zk-onboard/config"].ethereumNetwork.explorer;
    },
    version(): string {
      return "";
    },
    isDarkTheme(): boolean {
      return this.theme === "dark";
    },
  },
  methods: {
    toggleDarkMode() {
      this.theme = theme.toggleTheme();
      this.$inkline.config.variant = this.theme;
    },
  },
});
</script>
