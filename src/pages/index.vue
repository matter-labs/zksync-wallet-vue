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
      <div class="container-fluid _display-flex alternativeWithdrawContainer">
        <h2 class="_display-flex _margin-y-0 _align-items-center ">
          Can't find your wallet?
          <span class="icon-container _display-flex" @click="alternativeWithdrawPopup = true">
            <v-icon id="questionMark" name="ri-question-mark" class="iconInfo" scale="0.9" />
          </span>
        </h2>
        <h3>Or you’ve receive funds on your exchange address such as Binance?</h3>
        <a data-cy="core_connect_wallet_button" class="tileContainer _margin-top-1 _margin-right-05 _margin-md-right-2 _text-center" href="https://withdraw.zksync.io">
          <div class="tile">
            <img src="@/assets/imgs/logos/symbol.svg" alt="Alternative withdraw" />
          </div>
          <div class="tileName">Alternative Withdraw</div>
        </a>
      </div>
      <i-modal v-model="alternativeWithdrawPopup" size="md">
        <template slot="header">How does this all work?</template>
        <p>
          Your zkSync balances live in a separate space called Layer-2 (L2 for short). You won’t see them on
          <a :href="etherscanLink" rel="noopener noreferrer" target="_blank">etherscan.io</a> or in your Ethereum wallet, only in zkSync wallet and block explorer. Nevertheless,
          balances in zkSync are as secure as if though they were in L1 (the Ethereum mainnet).
          <a href="https://zksync.io/userdocs/security.html" target="_blank" rel="noopener noreferrer">Learn more.</a>
        </p>
        <p>You can move your balances <b>from L1</b> into zkSync by making a
          <nuxt-link class="logoLinkContainer" to="/transaction/deposit">Deposit</nuxt-link>
        </p>
        <p>To move them back from zkSync <b>to L1</b> you can make a
          <nuxt-link class="logoLinkContainer" to="/transaction/withdraw">Withdraw</nuxt-link>
        </p>
      </i-modal>
    </i-container>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  layout: "index", data() {
    return {
      alternativeWithdrawPopup: false, lockVisible: false, contactInfoShown: false
    };
  }, mounted() {
    this.$analytics.track("visit_login");
  }, methods: {
    async customWallet() {
      const refreshWalletTry = await this.$store.dispatch("zk-onboard/loginWithOnboard");
      if (!refreshWalletTry) {
        await this.$store.dispatch("zk-account/logout");
      } else {
        this.$analytics.track("login", { connectionType: "Ethereum Wallet", wallet: this.$store.getters["zk-onboard/selectedWallet"] });
        await this.$router.push("/account");
      }
    }, async walletConnect() {
      const refreshWalletTry = await this.$store.dispatch("zk-onboard/loginWithWalletConnect");
      if (!refreshWalletTry) {
        await this.$store.dispatch("zk-account/logout");
      } else {
        this.$analytics.track("login", { connectionType: "WalletConnect", wallet: this.$store.getters["zk-onboard/selectedWallet"] });
        await this.$router.push("/account");
      }
    }
  }
});
</script>
<style lang="scss" scoped>
.alternativeWithdrawContainer {
  display: flex;
  flex-direction: column !important;

  h2 {
    display: flex;
    flex-direction: row !important;
    justify-content: center;
    font-family: $font-family-primary-base;
    font-style: normal;
    font-weight: 400;
    font-size: 24px;
    line-height: 26px;
    text-align: center;
    color: #343A40;

    .icon-container
    {
      display: inline-flex !important;
      margin-right: 0.25rem;
    }
  }

  h3
  {
    font-family: $font-family-primary-base;
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 20px;
    text-align: center;
    color: #343A40;
    opacity: 0.44;
    max-width: 350px;
    display: inline-flex;
    margin: 0.5rem auto !important;
  }
}
</style>
