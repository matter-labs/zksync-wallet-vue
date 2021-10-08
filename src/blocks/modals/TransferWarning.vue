<template>
  <i-modal v-model="opened" size="md">
    <template slot="header">Transfer warning</template>
    <div>
      <div class="_padding-bottom-1">
        You are about to transfer money to an address that doesn't have a zkSync balance yet. The transfer will happen inside zkSync L2. If you want to move money from zkSync to
        the mainnet, please use the
        <nuxt-link to="/transaction/withdraw" @click.native="$accessor.closeActiveModal()">Withdraw</nuxt-link>
        function instead.
      </div>
      <i-checkbox v-model="transferWithdrawWarningCheckmark">Do not show this again</i-checkbox>
      <i-button block class="_margin-top-1" size="lg" variant="secondary" @click="proceed()">Transfer inside zkSync</i-button>
    </div>
  </i-modal>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "TransferWarning",
  data() {
    return {
      transferWithdrawWarningCheckmark: false,
    };
  },
  computed: {
    opened: {
      set(val): void {
        if (val === false) {
          this.$accessor.closeActiveModal();
          this.$emit("close");
        }
      },
      get(): boolean {
        return this.$accessor.currentModal !== null && this.$accessor.currentModal === "TransferWarning";
      },
    },
  },
  methods: {
    proceed() {
      if (this.transferWithdrawWarningCheckmark) {
        localStorage.setItem("canceledTransferWithdrawWarning", "true");
      }
      this.$emit("proceed");
      this.$accessor.closeActiveModal();
    },
  },
});
</script>
