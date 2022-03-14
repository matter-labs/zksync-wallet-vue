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
        <h2 class="_display-flex _margin-y-0 _align-items-center">
          Can't find your wallet?
          <span class="icon-container _display-flex" @click="$accessor.openModal('AlternativeWithdrawal')">
                <v-icon id="questionMark" name="ri-question-mark" class="iconInfo" scale="0.9" />
              </span>
        </h2>
        <h3>Or you’ve receive funds on your exchange address such as Binance?</h3>
        <a data-cy="core_connect_wallet_button" class="tileContainer _margin-top-1 _margin-right-05 _margin-md-right-2 _text-center" href="https://withdraw.zksync.io" target="_blank">
          <div class="tile">
            <img src="@/assets/imgs/logos/symbol.svg" alt="Alternative withdraw" />
          </div>
          <div class="tileName">Alternative Withdraw</div>
        </a>
      </div>
      <block-modals-alternative-withdraw/>
    </i-container>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  layout: "index", data() {
    return {
      lockVisible: false,
      contactInfoShown: false
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
    font-weight: 400;
    font-size: 20px !important;
    line-height: 24px;
    text-align: center;

    .icon-container {
      display: inline-flex !important;
      margin-left: 0.5rem;
    }
  }

  h3 {
    font-family: $font-family-primary-base;
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 20px;
    text-align: center;
    opacity: 0.44;
    max-width: 350px;
    display: flex;
    margin: 1rem auto !important;
  }

  a.tileContainer {
    text-decoration: none !important;
    color: $black !important;
  }
}

.-dark {
  .alternativeWithdrawContainer a.tileContainer {
    color: $white !important;
  }
}
</style>
