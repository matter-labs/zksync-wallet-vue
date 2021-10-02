<template>
  <i-modal v-model="opened" size="md">
    <template slot="header">
      <slot v-if="$slots.header" name="header" />
      <span v-else>Can't find your token?</span>
    </template>
    <p>
      An NFT can only be transferred/withdrawn after the block with its mint transaction is verified. This means the newly minted NFT may need to wait a few hours before it can
    </p>
  </i-modal>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "NoNftTokenFound",
  computed: {
    opened: {
      set(val): void {
        if (val === false) {
          this.$accessor.closeActiveModal();
        }
      },
      get(): boolean {
        return this.$accessor.currentModal !== null && this.$accessor.currentModal === "NoNftTokenFound";
      },
    },
  },
});
</script>
