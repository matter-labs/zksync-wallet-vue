<template>
  <i-modal v-model="opened" size="md">
    <template slot="header">
      <slot v-if="$slots.header" name="header" />
      <span v-else>Can't find a token</span>
    </template>
    <p>Minted tokens are available for transactions only after the Mint transaction gets verified.</p>
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
