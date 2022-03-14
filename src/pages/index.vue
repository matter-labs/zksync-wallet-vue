<template>
  <div class="indexPage">
    <i-container>
      <h1>Connect your L1 ETH Wallet to start</h1>
      <div class="container-fluid _flex-direction-row _display-flex connections">
        <div data-cy="core_connect_wallet_button" class="tileContainer _margin-right-05 _margin-md-right-2 _text-center" @click="customWallet()">
          <div class="tile">
            <img src="@/assets/imgs/wallets/external.png" alt="External"/>
          </div>
          <div class="tileName">Ethereum Wallet</div>
        </div>
        <div data-cy="core_connect_wallet_wc_button" class="tileContainer _margin-left-05 _margin-md-left-2 _text-center" @click="walletConnect()">
          <div class="tile">
            <img src="@/assets/imgs/wallets/wc.png" alt="Wallet Connect"/>
          </div>
          <div class="tileName">Wallet Connect</div>
        </div>
      </div>
      <div class="container-fluid _display-flex alternativeWithdrawContainer">
        <h2 class="_display-flex _margin-y-0 _align-items-center">
          Can't find your wallet?
          <span class="icon-container _display-flex" @click="$accessor.openModal('AlternativeWithdrawal')">
            <v-icon id="questionMark" name="ri-question-mark" class="iconInfo" :scale="0.9"/>
          </span>
        </h2>
        <h3 class="noteContainer">Or you’ve receive funds on your exchange address such as Binance?</h3>
        <a
          data-cy="core_connect_wallet_button"
          class="tileContainer _margin-right-05 _margin-md-right-2 _text-center"
          href="https://withdraw.zksync.io"
          target="_blank"
        >
          <div class="tile">
            <img src="@/assets/imgs/logos/symbol.svg" alt="Alternative withdraw"/>
          </div>
          <div class="tileName">Alternative Withdraw</div>
        </a>
      </div>
    </i-container>
    <block-modals-alternative-withdraw/>
  </div>
</template>

<script lang="ts">
import Vue from "vue"

export default Vue.extend({
  layout: "index",
  data() {
    return {
      contactInfoShown: false
    }
  },
  mounted() {
    this.$analytics.track("visit_login");
  },
  methods: {
    async customWallet() {
      const refreshWalletTry = await this.$store.dispatch("zk-onboard/loginWithOnboard")
      if (!refreshWalletTry) {
        await this.$store.dispatch("zk-account/logout")
      } else {
        this.$analytics.track("login", { connectionType: "Ethereum Wallet", wallet: this.$store.getters["zk-onboard/selectedWallet"] })
        await this.$router.push("/account")
      }
    },
    async walletConnect() {
      const refreshWalletTry = await this.$store.dispatch("zk-onboard/loginWithWalletConnect")
      if (!refreshWalletTry) {
        await this.$store.dispatch("zk-account/logout")
      } else {
        this.$analytics.track("login", { connectionType: "WalletConnect", wallet: this.$store.getters["zk-onboard/selectedWallet"] })
        await this.$router.push("/account")
      }
    }
  }
})
</script>
<style lang="scss" scoped>
.indexPage {
  width: 100%;
  height: 100%;
  padding-top: 60px;
  display: flex;
  justify-content: center;
  flex-direction: column;

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    //min-height: $minRouteHeightWithExtra;

    .tileContainer {
      cursor: pointer;

      @media screen and (min-width: $mobile) {
        padding-bottom: $footerHeight;
      }

      &:hover .tile {
        box-shadow: $hoverShadow;
      }

      .tile {
        max-width: 8rem;
        max-height: 8rem;
        width: 15vh;
        height: 15vh;
        min-height: 4.5rem;
        min-width: 4.5rem;
        margin: 0 auto 0.25rem;
        padding: 1.25rem;
        background-color: $white;
        border-radius: 20%;
        box-shadow: $tileShadow;
        transition: $transition1;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: $transition1;
        }

        .tileIcon {
          position: absolute;
          top: -24px;
          right: -24px;
          width: 48px;
          height: 48px;
          color: $violet;
          font-size: 20px;
          line-height: 48px;
          background-color: $white;
          border-radius: 50%;
          opacity: 0;
          transition: $transition2;
        }
      }

      .tileName {
        padding-top: 0.5rem;
        font-size: 18px;

        @media screen and (max-width: $mobile) {
          font-size: 16px !important;
        }
      }
    }

    h1 {
      font-weight: 800;
      font-size: 24px;
      text-align: center;
      margin: auto auto 1.75rem !important;
    }

    .connections {
      justify-content: space-evenly;
      min-width: 40%;
      max-width: 100%;

      .tileContainer {
        margin-left: 1rem;
        margin-right: 1rem;
        padding-bottom: 0;
      }
    }

    .alternativeWithdrawContainer {
      margin: auto !important;
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
        margin: 1rem auto 2rem !important;
      }

      a.tileContainer {
        text-decoration: none !important;
        color: $black !important;
      }
    }
  }

  @media (max-width: $mobile), (max-height: 30rem) {
    padding-top: 0;
    height: 100%;

    .container {
      height: auto;
      h1 {
        max-width: 350px;
        line-height: 35px;
        font-size: 22px;
        margin: 1rem auto !important;
      }

      .alternativeWithdrawContainer {
        h3 {
          margin: 0.3rem auto 0.5rem !important;
          font-size: 14px;
          line-height: 125% !important;
        }
      }
    }
  }

  @media (max-height: 37rem) {
    .container {

      h1 {
        line-height: 35px;
        font-size: 22px;
        margin: 1rem auto !important;
      }

      .alternativeWithdrawContainer {
        margin-top: 2rem !important;

        h3 {
          margin: 0.3rem auto 0.5rem !important;
          font-size: 14px;
          line-height: 125% !important;
        }
      }
    }
  }
  @media (min-height: 40rem) {
    .container {
      height: fit-content;
      .alternativeWithdrawContainer {
        margin-top: 4rem !important;
      }
    }
  }
}

.-dark {
  .tileContainer {
    .tileName {
      color: $white !important;
    }
  }
}


</style>
