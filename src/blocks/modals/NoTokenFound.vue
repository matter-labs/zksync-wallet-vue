<template>
  <i-modal v-model="opened" size="md">
    <template slot="header">Can't find your token?</template>

    <p>
      Your token may be listed as ERC20-XX. Search for your token by mainnet address on the
      <a href="https://zkscan.io/explorer/tokens/" target="_blank" rel="noopener noreferrer">tokens page</a> to see if this may be the case.
    </p>
    <p>If you still cannot find it, you can add support for any token via the "Add new token" button on the top right.</p>
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
