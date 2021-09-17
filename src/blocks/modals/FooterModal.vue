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
          <i-button block size="md" circle @click="toggleDarkMode">
            <v-icon v-if="isDarkTheme" name="ri-sun-fill" />
            <v-icon v-else name="ri-moon-fill" />
          </i-button>
        </div>
      </template>
    </i-modal>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import theme from "matter-dapp-ui/utils/theme";

export default Vue.extend({
  components: {},
  props: {
    value: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  data() {
    return {
      theme: theme.getUserTheme(),
    };
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
      return this.$store.getters["zk-onboard/config"].ethereumNetwork.explorer;
    },
    isDarkTheme(): boolean {
      return this.theme === "dark";
    },
  },
  methods: {
    toggleDarkMode(): void {
      this.theme = theme.toggleTheme();
      this.$inkline.config.variant = this.theme;
    },
  },
});
</script>
