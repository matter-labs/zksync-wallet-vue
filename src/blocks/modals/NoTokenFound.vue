<template>
  <i-modal v-model="isOpened" size="md">
    <template slot="header">Can't find a token</template>
    <div>
      <p>zkSync currently supports the most popular tokens, we will be adding more over time. <a
          href="//zksync.io/contact.html" target="_blank" rel="noopener noreferrer">Let us know what tokens you
        need</a>!</p>
    </div>
  </i-modal>
</template>
<script>
export default {
  name: "NoTokenFound",
  computed: {
    isOpened: function () {
      return this.$store.getters["currentModal"] !== null && this.$store.getters["currentModal"] === "NoTokenFound";
    },
  },
};
</script>
