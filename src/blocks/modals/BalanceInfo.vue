<template>
  <i-modal v-model="opened" size="md">
    <template #header>zkSync is a Layer-2 protocol</template>
    <p>
      Your zkSync balances live in a separate space called Layer-2 (L2 for short). You won’t see them on
      <a :href="`https://${etherscanDomain}/address/${$store.getters['zk-account/address']}`" rel="noopener noreferrer" target="_blank">{{ etherscanDomain }}</a> or in your
      Ethereum wallet, only in zkSync wallet and block explorer. Nevertheless, balances in zkSync are as secure as if though they were in L1 (the Ethereum mainnet).
      <a href="https://zksync.io/userdocs/security.html" rel="noopener noreferrer" target="_blank">Learn more.</a>
    </p>
    <p>
      You can move your balances <b>from L1</b> into zkSync by making a
      <nuxt-link class="logoLinkContainer" to="/transaction/deposit">Deposit</nuxt-link>
    </p>
    <p>
      To move them back from zkSync <b>to L1</b> you can make a
      <nuxt-link class="logoLinkContainer" to="/transaction/withdraw">Withdraw</nuxt-link>
    </p>
  </i-modal>
</template>

<script lang="ts">
import Vue from "vue";

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
      const network = this.$store.getters["zk-provider/network"];
      return `${network.search("rinkeby") !== -1 ? "rinkeby." : network.search("ropsten") === -1 ? "ropsten." : ""}etherscan.io`;
    },
  },
});
</script>
