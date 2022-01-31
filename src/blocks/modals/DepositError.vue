<template>
  <i-modal v-model="opened" size="md">
    <template slot="header">Depositing failed due to an error</template>
    <p>{{ errorText }}</p>
    <i-button class="_margin-top-1" block size="lg" variant="secondary" @click="processButton">Back to the Deposit</i-button>
  </i-modal>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "DepositError",
  props: {
    errorText: { type: String, default: null, required: true },
  },
  computed: {
    opened: {
      set(val): void {
        if (val === false) {
          this.$accessor.closeActiveModal();
        }
      },
      get(): boolean {
        return this.$accessor.currentModal !== null && this.$accessor.currentModal === "DepositError";
      },
    },
  },
  methods: {
    processButton(): void {
      this.$accessor.closeActiveModal();
      this.$nextTick(() => {
        this.$router.push("/transaction/deposit");
      });
    },
  },
});
</script>