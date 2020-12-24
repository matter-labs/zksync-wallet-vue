<template>
    <footer class="_padding-y-2">
        <i-container>
            <i-row center>
                <i-button block size="lg" circle @click="toggleDarkMode">
                    <i-icon icon="light" />
                </i-button>
            </i-row>
            <i-row center class="_margin-top-2">
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
            </i-row>
        </i-container>
    </footer>
</template>

<script>
export default {
  methods: {
    toggleDarkMode() {
      this.$inkline.config.variant = this.$inkline.config.variant === "light" ? "dark" : "light";
      localStorage.setItem("colorTheme", this.$inkline.config.variant);
    },
  },
};
</script>
