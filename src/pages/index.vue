<template>
  <div class="indexPage">
    <i-container>
      <h1>Connect your L1 ETH Wallet to start</h1>
      <div class="container-fluid _flex-direction-row _display-flex connections">
        <button data-cy="core_connect_wallet_button" class="tileContainer _text-center" @click="customWallet()">
          <div class="tile">
            <img src="/images/wallets/external.png" alt="External" />
          </div>
          <div class="tileName">Ethereum Wallet</div>
        </button>
        <button data-cy="core_connect_wallet_wc_button" class="tileContainer _text-center" @click="walletConnect()">
          <div class="tile">
            <img src="/images/wallets/wc.png" alt="Wallet Connect" />
          </div>
          <div class="tileName">Wallet Connect</div>
        </button>
        <button
          v-if="isMainnet"
          data-cy="core_connect_wallet_argent_button"
          class="tileContainer _text-center"
          @click="walletConnect(true)"
        >
          <div class="tile">
            <img src="/images/wallets/argent.svg" alt="Argent" />
          </div>
          <div class="tileName">Argent Wallet</div>
        </button>
      </div>
      <div class="container-fluid _display-flex alternativeWithdrawContainer">
        <h2 class="_display-flex _margin-y-0 _align-items-center">
          Can't find your wallet?
          <span class="icon-container _display-flex" @click="$accessor.openModal('AlternativeWithdrawal')">
            <v-icon id="questionMark" name="ri-question-mark" class="iconInfo" :scale="0.9" />
          </span>
        </h2>
        <h3 class="noteContainer">Or you’ve receive funds on your exchange address such as Binance?</h3>
        <a
          data-cy="core_connect_wallet_button"
          class="tileContainer _text-center _margin-top-1"
          href="https://withdraw.zksync.io"
          target="_blank"
        >
          <div class="tile">
            <img src="/images/logo-no-letters.svg" alt="Alternative withdraw" />
          </div>
          <div class="tileName">Alternative Withdraw</div>
        </a>
      </div>
    </i-container>
    <block-modals-alternative-withdraw />
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  layout: "index",
  computed: {
    isMainnet(): boolean {
      return this.$store.getters["zk-provider/network"] === "mainnet";
    },
  },
  mounted() {
    this.$analytics.track("visit_login");
  },
  methods: {
    async customWallet() {
      const refreshWalletTry = await this.$store.dispatch("zk-onboard/loginWithOnboard");
      if (!refreshWalletTry) {
        return this.$store.dispatch("zk-account/logout");
      } else {
        this.$analytics.track("login", {
          connectionType: "Ethereum Wallet",
          wallet: this.$store.getters["zk-onboard/selectedWallet"],
        });
        return this.$router.push("/account");
      }
    },
    async walletConnect(argent: boolean = false) {
      const refreshWalletTry = await this.$store.dispatch(
        `zk-onboard/${argent ? "loginWithArgent" : "loginWithWalletConnect"}`
      );
      if (!refreshWalletTry) {
        return this.$store.dispatch("zk-account/logout");
      } else {
        this.$analytics.track("login", {
          connectionType: "WalletConnect",
          wallet: this.$store.getters["zk-onboard/selectedWallet"],
        });
        return this.$router.push("/account");
      }
    },
  },
});
</script>
<style lang="scss" scoped>
.indexPage {
  width: 100%;
  height: 100%;
  padding-top: 93px;
  padding-bottom: 56px;
  display: flex;
  justify-content: center;
  flex-direction: column;

  .container {
    gap: 1rem;
    column-gap: 1rem;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    max-width: 100vw;
    //min-height: $minRouteHeightWithExtra;

    .tileContainer {
      flex-basis: 30%;
      cursor: pointer;
      max-width: 10rem;
      width: fit-content;
      height: fit-content;
      padding-bottom: 0;
      border: none;
      color: unset;
      background: unset;

      &:hover .tile {
        box-shadow: $hoverShadow;
      }

      &:focus {
        outline-color: $lightViolet;
        border: none !important;
        outline-offset: 0.25rem;
        outline-width: thin;
        border-radius: 0.5rem;
      }

      .tile {
        margin: 0 auto 0.25rem;
        padding: 1rem;
        height: fit-content;
        width: fit-content;
        background-color: $white;
        border-radius: 20%;
        box-shadow: $tileShadow;
        transition: $transition1;

        img {
          height: 76px;
          object-fit: contain;
          transition: $transition1;

          @media screen and (max-width: $mobile) {
            height: 40px;
            width: 40px;
          }
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

    a.tileContainer {
      margin-left: auto;
      margin-right: auto;
    }

    .connections {
      justify-content: space-between;
      row-gap: 1rem;
      align-items: stretch;
      flex-wrap: nowrap;
      width: fit-content;
      max-width: calc(100vw - 24px);
      height: fit-content;
      text-align: center;
      margin-left: auto;
      margin-right: auto;
    }

    h1 {
      font-weight: 800;
      font-size: 24px;
      text-align: center;
      margin: auto auto 1.75rem !important;
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
        margin-top: 1.5rem !important;

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
  @media (min-height: 700px) {
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
    &:focus {
      outline-color: $accentBg !important;
    }

    .tileName {
      color: $white !important;
    }
  }
}
</style>
