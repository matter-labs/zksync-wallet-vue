<template>
  <i-modal v-model="opened" size="md" data-cy="fee_calculation_error_modal">
    <template slot="header">Requesting fee error</template>
    <p>There was an error while requesting the fee. Try to choose different fee token or try again later.</p>
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
        return this.$accessor.currentModal !== null && this.$accessor.currentModal === "FeeReqError";
      },
    },
  },
});
</script>
