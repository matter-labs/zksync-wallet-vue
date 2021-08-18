<template>
  <div class="indexPage">
    <i-container>
      <h1>Connect your L1 ETH Wallet to start</h1>
      <div data-cy="core_connect_wallet_button" class="tileContainer _margin-top-1" @click="customWallet">
        <div class="tile">
          <img src="@/assets/imgs/wallets/external.png" alt="External" />
        </div>
        <div class="tileName">Connect your wallet</div>
      </div>
    </i-container>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  layout: "guest",
  data() {
    return {
      lockVisible: false,
      contactInfoShown: false,
    };
  },
  methods: {
    async customWallet() {
      const result = await this.$accessor.wallet.walletRefresh(false);
      if (result) {
        this.$router.push("/account");
      }
    },
  },
});
</script>
