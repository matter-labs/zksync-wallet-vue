<template>
  <i-modal v-model="opened" size="md">
    <template #header>zkSync is a Layer-2 protocol</template>
    <p>
      Your zkSync lite balances live in a separate space called Layer-2 (L2 for short). You won’t see them on
      <a
        :href="`https://${etherscanDomain}/address/${$store.getters['zk-account/address']}`"
        rel="noopener noreferrer"
        target="_blank"
        >{{ etherscanDomain }}</a
      >
      or in your Ethereum wallet, only in zkSync lite wallet and block explorer. Nevertheless, balances in zkSync lite
      are as secure as if though they were in L1 (the Ethereum mainnet).
      <a href="https://docs.lite.zksync.io/userdocs/security.html" rel="noopener noreferrer" target="_blank">Learn more.</a>
    </p>
    <p>
      You can move your balances <b>from L1</b> into zkSync lite by making a
      <nuxt-link class="logoLinkContainer" to="/transaction/deposit">Deposit</nuxt-link>
    </p>
    <p>
      To move them back from zkSync lite <b>to L1</b> you can make a
      <nuxt-link class="logoLinkContainer" to="/transaction/withdraw">Withdraw</nuxt-link>
    </p>
  </i-modal>
</template>

<script lang="ts">
import Vue from "vue";
import { Network } from "zksync/build/types";

export default Vue.extend({
  name: "BlockModalsBalanceInfo",
  computed: {
    opened: {
      set(val): void {
        if (val === false) {
          this.$accessor.closeActiveModal();
        }
      },
      get(): boolean {
        return this.$accessor.currentModal !== null && this.$accessor.currentModal === "BalanceInfo";
      },
    },
    etherscanDomain(): string {
      const network: Network = this.$store.getters["zk-provider/network"];
      switch (network) {
        case "goerli":
        case "goerli-beta":
          return "goerli.etherscan.io";
        case "mainnet":
        default:
          return "etherscan.io";
      }
    },
  },
});
</script>
