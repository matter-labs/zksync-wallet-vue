<template>
  <div class="indexPage">
    <i-container>
      <h1>Connect your L1 ETH Wallet to start</h1>
      <div class="container-fluid _flex-direction-row _display-flex connections">
        <div data-cy="core_connect_wallet_button" class="tileContainer _margin-top-1 _margin-right-05 _margin-md-right-2 _text-center" @click="customWallet()">
          <div class="tile">
            <img src="@/assets/imgs/wallets/external.png" alt="External" />
          </div>
          <div class="tileName">Ethereum Wallet</div>
        </div>
        <div data-cy="core_connect_wallet_wc_button" class="tileContainer _margin-top-1 _margin-left-05 _margin-md-left-2 _text-center" @click="walletConnect()">
          <div class="tile">
            <img src="@/assets/imgs/wallets/wc.png" alt="Wallet Connect" />
          </div>
          <div class="tileName">Wallet Connect</div>
        </div>
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
      const refreshWalletTry = await this.$store.dispatch("zk-onboard/loginWithOnboard");
      if (!refreshWalletTry) {
        await this.$store.dispatch("zk-account/logout");
      } else {
        await this.$router.push("/account");
      }
    },
    async walletConnect() {
      const refreshWalletTry = await this.$store.dispatch("zk-onboard/loginWithWalletConnect");
      if (!refreshWalletTry) {
        await this.$store.dispatch("zk-account/logout");
      } else {
        await this.$router.push("/account");
      }
    },
  },
});
</script>
