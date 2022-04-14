<template>
  <div class="walletPage dappPageWrapper">
    <div class="top-up-tile tileBlock">
      <h3 class="tileHeadline withBtn h3">
        <nuxt-link to="/account" class="_icon-wrapped -rounded -sm returnBtn _display-flex">
          <v-icon name="ri-arrow-left-line" scale="1" />
        </nuxt-link>
        Top&nbsp;up
      </h3>
      <section class="tileSubContainer">
        <h4 class="tileSmallHeadline">
          Buy Crypto with Credit Card
          <div class="secondaryText estimatedFee">
            <v-icon name="la-charging-station-solid" />
            <span><b>Fee:</b>&nbsp;~3-5%</span>
          </div>
        </h4>
        <div class="secondaryText small _margin-bottom-05">
          You can buy crypto directly on zkSync with your credit card, just go through KYC process of our partners and
          enter your wallet address
        </div>
        <providers :show-providers="{ ramp: true, banxa: true, moonpay: true, utorg: true }" />
      </section>
      <div class="orDivider">
        <div class="line"></div>
        <div class="orText">or</div>
        <div class="line"></div>
      </div>
      <section class="tileSubContainer">
        <h4 class="tileSmallHeadline">
          Exchanges
          <div class="secondaryText estimatedFee">
            <v-icon name="la-charging-station-solid" />
            <span><b>Fee:</b>&nbsp;~0.5%</span>
          </div>
        </h4>
        <div class="secondaryText small _margin-bottom-05">
          zkSync v1 is integrated with exchanges, so you can deposit/withdraw funds from your favorite exchanges
          directly inside the zkSync network using the benefits of the low fees
        </div>
        <providers :show-providers="{ okex: false, bybit: true }" />
      </section>
      <div class="orDivider">
        <div class="line"></div>
        <div class="orText">or</div>
        <div class="line"></div>
      </div>
      <section class="tileSubContainer">
        <h4 class="tileSmallHeadline">
          Bridges
          <div class="secondaryText estimatedFee">
            <v-icon name="la-charging-station-solid" />
            <span><b>Fee:</b>&nbsp;~1-90$</span>
          </div>
        </h4>
        <div class="secondaryText small _margin-bottom-05">
          You can bridge your assets from other networks & exchanges using one of our supported bridges
        </div>
        <providers :show-providers="{ layerSwap: true, zksync: true, orbiter: true }" />
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  computed: {
    zigZagLink(): string | null {
      switch (this.$store.getters["zk-provider/network"]) {
        case "mainnet":
          return "https://trade.zigzag.exchange/";
        case "rinkeby":
          return "https://trade.zigzag.exchange/?network=zksync-rinkeby";
        default:
          return null;
      }
    },
  },
  mounted() {
    this.$analytics.track("visit_top-up");
  },
  methods: {
    openAccountModal(): void {
      this.$accessor.setAccountModalState(true);
    },
    openBalanceInfoModal(): void {
      this.$accessor.openModal("BalanceInfo");
    },
  },
});
</script>
<style lang="scss">
.dappPageWrapper.walletPage {
  .top-up-tile h3.tileHeadline {
    margin-bottom: 10px;
  }

  .tileSubContainer {
    h4.tileSmallHeadline {
      font-weight: 700;
      font-size: 16px;
      line-height: 22px;
      margin: 0 0 1rem;
      display: flex;
      flex-flow: row nowrap;
      justify-content: space-between;
      align-items: center;

      .estimatedFee {
        display: inline-flex;
        align-items: center;

        span {
          font-weight: 300 !important;

          b {
            font-weight: 600 !important;
          }
        }

        svg {
          margin-right: 3px;
        }
      }
    }
  }

  .orDivider {
    width: 100%;
    height: max-content;
    display: grid;
    grid-template-columns: 1fr max-content 1fr;
    grid-template-rows: 100%;
    grid-gap: 17px;
    align-items: center;
    padding: 23px 0;

    .line {
      width: 100%;
      height: 1px;
      background-color: #eeeeee;
      transition: background-color $transition1;
      will-change: background-color;
    }

    .orText {
      font-size: 18px;
      font-weight: 700;
      color: #eeeeee;
      text-align: center;
      transition: color $transition1;
      will-change: color;
    }
  }

  @media screen and (max-width: $mobile) {
    .top-up-tile h3.tileHeadline {
      margin-bottom: 0;
    }

    .tileSubContainer {
      h4.tileSmallHeadline {
        font-weight: 600 !important;
        font-size: 14px;
        margin-bottom: 0.5rem;
        line-height: 20px;

        .estimatedFee {
          span {
            font-size: 14px !important;
          }
        }
      }
    }
  }
}

.inkline.-dark {
  .dappPageWrapper {
    .tileSmallHeadline {
      color: $white;
    }

    .orDivider {
      .line {
        background-color: transparentize($color: $gray, $amount: 0.5);
      }

      .orText {
        color: transparentize($color: $gray, $amount: 0.3);
      }
    }
  }
}
</style>
