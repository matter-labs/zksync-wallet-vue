<template>
  <i-modal v-model="opened" data-cy="send_l1_understand_modal" size="md">
    <template slot="header">Sending to Ethereum L1</template>
    <div>
      <div class="_padding-bottom-1">
        <div class="_padding-bottom-1">You are about to send funds to Ethereum L1.</div>
        <ul class="_padding-left-1">
          <li>To prevent loss of funds, please verify that the recipient supports smart contract transactions.</li>
          <li>Once sent, you will see your funds on L1 between 30 min and 7 hours.</li>
          <li>If you are trying to send to an exchange, the best method is to first send to your own address and then to the exchange.</li>
        </ul>
      </div>
      <i-checkbox v-model="transferWithdrawWarningCheckmark">Do not show this again</i-checkbox>
      <i-button block class="_margin-top-1" size="lg" variant="secondary" data-cy="send_l1_understand_button" @click="proceed()">I Understand</i-button>
    </div>
  </i-modal>
</template>

<script lang="ts">
import Vue from "vue";

export const DO_NOT_SHOW_WITHDRAW_WARNING_KEY = "doNotShowWithdrawWarning";
export default Vue.extend({
  name: "WithdrawWarning",
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
        }
      },
      get(): boolean {
        return this.$accessor.currentModal !== null && this.$accessor.currentModal === "WithdrawWarning";
      },
    },
  },
  methods: {
    proceed() {
      if (this.transferWithdrawWarningCheckmark) {
        localStorage.setItem(DO_NOT_SHOW_WITHDRAW_WARNING_KEY, "true");
      }
      this.$accessor.closeActiveModal(true);
    },
  },
});
</script>
