<template>
  <i-modal v-model="isOpened" size="md">
    <template slot="header">Allowence</template>
    <p>
      Allowence is used to limit the amount of L1 balance that zkSync will be able to use. It is recomended to leave the field empty, so the unlimited allowence is set and you would have to pay the fee only once.
    </p>
  </i-modal>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "Allowence",
  computed: {
    isOpened: {
      set(val): void {
        if (val === false) {
          this.$accessor.closeActiveModal();
        }
      },
      get(): boolean {
        return this.$accessor.currentModal !== null && this.$accessor.currentModal === "Allowence";
      },
    },
  },
});
</script>
