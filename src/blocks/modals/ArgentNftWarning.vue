<template>
  <i-modal v-model="opened" size="md">
    <template slot="header">Argent NFTs not supported</template>
    <p>Argent Wallet does not support NFT operations yet. You can still receive NFTs but you won't be able to transfer or withdraw it.</p>
    <template v-if="checkmarkDisplayed">
      <i-checkbox v-model="argentNftWarningCheckmark">Do not show this warning again</i-checkbox>
      <i-button block class="_margin-top-1" size="lg" variant="secondary" @click="proceed()">Ok</i-button>
    </template>
  </i-modal>
</template>

<script lang="ts">
import Vue from "vue";

export const warningCanceledKey = "canceledArgentNftWarning";
export default Vue.extend({
  name: "ArgentNftWarning",
  data() {
    return {
      argentNftWarningCheckmark: false,
      checkmarkDisplayed: !localStorage.getItem(warningCanceledKey),
    };
  },
  computed: {
    opened: {
      set(val): void {
        if (val === false) {
          this.$accessor.closeActiveModal();
        }
      },
      get(): boolean {
        return this.$accessor.currentModal !== null && this.$accessor.currentModal === "ArgentNftWarning";
      },
    },
  },
  methods: {
    proceed() {
      if (this.argentNftWarningCheckmark) {
        localStorage.setItem(warningCanceledKey, "true");
      }
      this.$accessor.closeActiveModal(true);
    },
  },
});
</script>
