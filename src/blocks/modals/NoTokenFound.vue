<template>
  <i-modal v-model="opened" size="md">
    <template slot="header">Can't find a token</template>
    <p>
      zkSync currently supports the most popular tokens, we will be adding more over time.
      <a href="https://zksync.io/contact.html" target="_blank" rel="noopener noreferrer">Let us know what tokens you need</a>!
    </p>
  </i-modal>
</template>

<script lang="ts">
import Vue from "vue";

/**
 * @todo: Add details of permissionless procedure of pushing new tokens
 */
export default Vue.extend({
  name: "NoTokenFound",
  computed: {
    opened: {
      set(val): void {
        if (val === false) {
          this.$accessor.closeActiveModal();
        }
      },
      get(): boolean {
        return this.$accessor.currentModal !== null && this.$accessor.currentModal === "NoTokenFound";
      },
    },
  },
});
</script>
