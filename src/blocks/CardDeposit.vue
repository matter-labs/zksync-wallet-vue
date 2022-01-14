<template>
  <div class="cryptoProviders">
    <div :class="{ disabled: !isRampSupported }" class="providerOption rampProvider" @click="buyWithRamp">
      <label><img class="ramp-logo" src="/RampLogo.svg" alt="Ramp" />Ramp</label>
    </div>
    <div :class="{ disabled: !isBanxaSupported }" class="providerOption banxaProvider" @click="buyWithBanxa">
      <block-svg-banxa />
    </div>
    <div :class="{ disabled: !isMoonpaySupported }" class="providerOption moonpayProvider" @click="buyWithMoonpay">
      <block-svg-moonpay />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { RampInstantSDK } from "@ramp-network/ramp-instant-sdk";
import { rampConfig, banxaConfig, moonpayConfig } from "@/utils/config";
import { TokenSymbol } from "zksync/build/types";

export default Vue.extend({
  computed: {
    rampConfig(): {
      url: string | undefined;
      hostApiKey: string | undefined;
    } | null {
      return rampConfig[this.$store.getters["zk-provider/network"]];
    },
    banxaConfig(): {
      url: string;
    } | null {
      return banxaConfig[this.$store.getters["zk-provider/network"]];
    },
    moonpayConfig(): {
      url: string;
      apiPublicKey: string;
    } | null {
      return moonpayConfig[this.$store.getters["zk-provider/network"]];
    },
    address(): string {
      return this.$store.getters["zk-account/address"];
    },
    redirectURL(): string {
      return window.location.origin + "/account";
    },
    isRampSupported(): boolean {
      return !!this.rampConfig;
    },
    isBanxaSupported(): boolean {
      return !!this.banxaConfig;
    },
    isMoonpaySupported(): boolean {
      return !!this.moonpayConfig;
    },
    moonpayDefaultToken(): TokenSymbol {
      let symbol: TokenSymbol | undefined = this.$store.getters["zk-transaction/symbol"];
      if (!symbol) {
        symbol = "DAI";
      }
      if (!["DAI","USDT","USDC"].includes(symbol)) {
        return "DAI";
      } else {
        return symbol;
      }
    },
  },
  methods: {
    buyWithRamp() {
      if (!this.isRampSupported) {
        return;
      }
      this.$analytics.track("click_on_buy_with_ramp");

      new RampInstantSDK({
        hostAppName: "zkSync Wallet",
        hostLogoUrl: window.location.origin + "/favicon-dark.png",
        variant: "hosted-auto",
        swapAsset: "ZKSYNC_*",
        userAddress: this.address,
        ...this.rampConfig,
      }).show();
    },
    buyWithBanxa() {
      if (!this.isBanxaSupported) {
        return;
      }
      this.$analytics.track("click_on_buy_with_banxa");
      window.open(
        `${this.banxaConfig!.url}?walletAddress=${this.address}&accountReference=${this.address}&returnUrlOnSuccess=${encodeURIComponent(
          this.redirectURL,
        )}&returnUrlOnFailure=${encodeURIComponent(this.redirectURL)}`,
        "_blank",
      );
    },
    buyWithMoonpay() {
      if (!this.isMoonpaySupported) {
        return;
      }
      this.$analytics.track("click_on_moonpay");
      const availableZksyncCurrencies = ["usdc", "usdt", "dai"].map((e) => `${e}_zksync`);
      window.open(
        `${this.moonpayConfig!.url}?apiKey=${this.moonpayConfig!.apiPublicKey}&defaultCurrencyCode=${this.moonpayDefaultToken.toLowerCase()}_zksync&walletAddress=${this.address}&showOnlyCurrencies=${availableZksyncCurrencies.join(
          ",",
        )}&walletAddresses=${encodeURIComponent(JSON.stringify(Object.fromEntries(availableZksyncCurrencies.map((e) => [e, this.address]))))}&redirectURL=${encodeURIComponent(this.redirectURL)}`,
        "_blank",
      );
    },
  },
});
</script>

<style lang="scss" scoped>
.cryptoProviders {
  display: grid;
  width: 100%;
  height: max-content;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-flow: row;
  grid-auto-rows: 52px;
  grid-gap: 11px;

  .providerOption {
    position: relative;
    width: 100%;
    height: 100%;
    border: 1px solid #eeeeee;
    border-radius: 6px;
    box-sizing: border-box;
    transition: $transition1;
    transition-property: border-color, opacity;
    will-change: border-color, opacity;
    &.disabled {
      border-color: transparentize($color: #eeeeee, $amount: 0.7);

      & > *:not(.loaderContainer) {
        opacity: 0.3;
      }
    }
    &:not(.disabled):hover {
      border-color: #5d65b9 !important;
      cursor: pointer;
    }

    & > * {
      pointer-events: none;
    }
    .loaderContainer {
      position: absolute;
      width: 20px;
      height: 20px;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
  }
}
.rampProvider {
  label {
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    margin: 0 0 0 3px;
    color: #22272f;
    transition: $transition1;
    transition-property: opacity, color;
    will-change: opacity, color;
  }

  .ramp-logo {
    margin-right: 5px;
  }
}
.banxaProvider,
.moonpayProvider {
  display: flex;
  align-items: center;

  svg {
    height: 16px;
    width: auto;
    margin: 0 auto;
    transition: $transition1;
    transition-property: opacity;
    will-change: opacity;
  }
}

.inkline.-dark {
  .dappPageWrapper {
    .cryptoProviders {
      .providerOption {
        border-color: transparentize($color: $gray, $amount: 0.65);
        &.disabled {
          border-color: transparentize($color: $gray, $amount: 0.85) !important;
        }
      }
    }
  }
  .rampProvider {
    label {
      color: #f8f9fa;
    }
  }
}
</style>
