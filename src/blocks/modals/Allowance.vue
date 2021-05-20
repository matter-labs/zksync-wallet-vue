<template>
  <i-modal v-model="opened" size="md">
    <template slot="header">Allowance</template>
    <p>
      Allowance is used to limit the amount of L1 balance that zkSync will be able to use. It is recommended to set unlimited allowance so you would have to pay the fee only once.
    </p>
  </i-modal>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "Allowance",
  computed: {
    opened: {
      set(val): void {
        if (val === false) {
          this.$accessor.closeActiveModal();
        }
      },
      get(): boolean {
        return this.$accessor.currentModal !== null && this.$accessor.currentModal === "Allowance";
      },
    },
  },
});
</script>
