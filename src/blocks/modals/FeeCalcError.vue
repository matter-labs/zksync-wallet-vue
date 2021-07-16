<template>
  <i-modal v-model="opened" size="md">
    <template slot="header">Fee calculation error</template>
    <p>There was an error while calculating the fee. Try to choose different token for paying the fee or try again later.</p>
  </i-modal>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "FeeCalcError",
  computed: {
    opened: {
      set(val): void {
        if (val === false) {
          this.$accessor.closeActiveModal();
        }
      },
      get(): boolean {
        return this.$accessor.currentModal !== null && this.$accessor.currentModal === "FeeCalcError";
      },
    },
  },
});
</script>
