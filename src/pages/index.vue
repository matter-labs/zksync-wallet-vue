<template>
  <div class="indexPage">
    <i-container>
      <h1>Connect your L1 ETH Wallet to start</h1>
      <div data-cy="connectWalet-btn" class="tileContainer _margin-top-1" @click="customWallet">
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
  layout: "index",
  data() {
    return {
      lockVisible: false,
      contactInfoShown: false,
    };
  },
  methods: {
    async customWallet() {
      this.$accessor.wallet.onboard?.config({
        darkMode: this.$inkline.config.variant !== "light",
      });
      const refreshWalletTry = await this.$accessor.wallet.walletRefresh(true);
      if (!refreshWalletTry) {
        this.$accessor.wallet.logout();
      } else {
        await this.$router.push("/account");
      }
    },
  },
});
</script>
