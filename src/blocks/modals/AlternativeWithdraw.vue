<template>
  <i-modal v-model="opened" size="md">
    <template #header>How does this all work?</template>
    <p>
      <strong>zkSync Alternative Withdrawal</strong> is way to get funds to Layer 1 without interacting directly with
      the protocol. zkSync supports most of web3-compatible wallets, so we highly recommend you to use the so the
      official client to withdraw funds if that is possible as it is cheaper and more convenient.
    </p>
    <div class="_margin-top-1">
      In order for the account to be eligible for an alternative withdrawal all of the following must be true:
      <ul>
        <li>It must exist (hold any funds) in the zkSync network for at least 24 hours.</li>
        <li>The account must be locked (no ChangePubKey operation so far).</li>
      </ul>
    </div>
    <p>
      The amount to compensate is somewhat higher than the base fee due to technical reasons, but the overhead is
      negligible (less than 0.000001 ETH).
    </p>
  </i-modal>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "BlockModalsAlternativeWithdrawal",
  computed: {
    opened: {
      set(val): void {
        if (val === false) {
          this.$accessor.closeActiveModal();
        }
      },
      get(): boolean {
        return this.$accessor.currentModal !== null && this.$accessor.currentModal === "AlternativeWithdrawal";
      },
    },
  },
});
</script>
