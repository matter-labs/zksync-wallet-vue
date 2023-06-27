<template>
  <i-layout-footer class="mainFooter">
    <block-modals-footer-modal v-model="footerModal" />
    <block-modals-network-switch />
    <div
      class="container _display-flex _flex-direction-row _align-items-center _justify-content-space-between _justify-content_mobile-space-around"
    >
      <i-row center class="linksRow _margin-0 _margin-md-top-1 _flex-nowrap _text-nowrap">
        <div class="_padding-1-2 _padding-md-x-1">
          <a target="_blank" class="footer-link" :href="blockExplorerLink">RIFexplorer</a>
        </div>
      </i-row>
      <i-row center class="_text-nowrap _align-items-center _margin-0">
        <i-button
          id="btn-switch-network"
          size="md"
          circle
          class="_margin-right-1 _hidden-sm-and-down"
          data-cy="network_switch_icon"
          outline
          variant="dark"
          @click="openNetworkSwitchModal"
        >
          <rootstock-icon />
        </i-button>
        <i-button
          id="btn-switch-theme"
          size="md"
          circle
          class="floating-on-mobile _hidden-sm-and-down"
          outline
          variant="dark"
          @click="toggleDarkMode"
        >
          <v-icon v-if="isDarkTheme" name="ri-sun-fill" />
          <v-icon v-else name="ri-moon-fill" />
        </i-button>
        <i-button
          class="_hidden-md-and-up floating-on-mobile"
          size="md"
          circle
          outline
          variant="dark"
          @click="footerModal = !footerModal"
        >
          <v-icon name="ri-more-2-fill" />
        </i-button>
      </i-row>
    </div>
  </i-layout-footer>
</template>

<script lang="ts">
import Vue from "vue";
import theme from "@rsksmart/rif-rollup-nuxt-core/utils/theme";
import RootstockIcon from "@/components/RootstockIcon.vue";

export default Vue.extend({
  name: "Footer",
  components: { RootstockIcon },
  data() {
    return {
      footerModal: false,
      theme: theme.getUserTheme(),
    };
  },
  computed: {
    blockExplorerLink(): string {
      return this.$store.getters["zk-onboard/config"].zkSyncNetwork.explorer;
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
    openNetworkSwitchModal() {
      this.$analytics.track("visit_change_network");
      return this.$accessor.openModal("NetworkSwitch");
    },
  },
});
</script>
<style lang="scss"></style>
