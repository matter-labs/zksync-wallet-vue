<template>
  <footer class="_padding-y-1 _padding-x-3 _margin-x-auto mainFooter">
    <div class="_display-flex _flex-direction-row _align-items-center _justify-content-space-between">
      <i-row center class="linksRow _margin-top-1">
        <div class="_padding-x-1">
          <a target="_blank" class="footer-link link" href="//zksync.io/faq/intro.html">Docs</a>
        </div>
        <div class="_padding-x-1">
          <a target="_blank" class="footer-link" href="https://zksync.io/legal/terms.html">Terms of Use</a>
        </div>
        <div class="_padding-x-1">
          <a target="_blank" class="footer-link" href="https://zksync.io/legal/privacy.html">Privacy Policy</a>
        </div>
        <div class="_padding-x-1">
          <a target="_blank" class="footer-link" href="//zksync.io/contact.html">Contact</a>
        </div>
        <div class="_padding-x-1">
          <i-badge v-if="version" variant="secondary" class="outline-white _margin-left-1">
            v.{{version}}
          </i-badge>
        </div>
      </i-row>
      <i-row center>
        <i-button block size="lg" circle @click="toggleDarkMode">
          <i-icon icon="light"/>
        </i-button>
      </i-row>
    </div>
  </footer>
</template>

<script>
import { GIT_REVISION_SHORT } from "@/plugins/build";
export default {
  data() {
    return {
      version: GIT_REVISION_SHORT,
    };
  },
  methods: {
    toggleDarkMode() {
      this.$inkline.config.variant = this.$inkline.config.variant === "light" ? "dark" : "light";
      localStorage.setItem("colorTheme", this.$inkline.config.variant);
    },
  },
};
</script>
