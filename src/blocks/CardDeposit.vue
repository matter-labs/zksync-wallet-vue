<template>
  <div class="cryptoProviders">
    <div :class="{ disabled: !isRampSupported }" class="providerOption rampProvider" @click="buyWithRamp">
      <label><img class="ramp-logo" src="/RampLogo.svg" alt="Ramp" />Ramp</label>
    </div>
    <div :class="{ disabled: !isBanxaSupported }" class="providerOption banxaProvider" @click="buyWithBanxa">
      <block-svg-banxa />
    </div>
    <!-- <div :class="{ disabled: !isMoonpaySupported }" class="providerOption moonpayProvider" @click="buyWithMoonpay">
      <block-svg-moonpay />
    </div> -->
    <div :class="{ disabled: !isOrbiterSupported }" class="providerOption orbiterProvider" @click="buyWithOrbiter">
      <block-svg-orbiter />
    </div>
    <div :class="{ disabled: !isUtorgSupported }" class="providerOption utorgProvider" @click="buyWithUtorg">
      <block-svg-utorg />
    </div>
    <block-modals-deposit-error :errorText="errorText"/>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { RampInstantSDK } from "@ramp-network/ramp-instant-sdk";
import { rampConfig, banxaConfig, moonpayConfig } from "@/utils/config";

export default Vue.extend({
  computed: {
    rampConfig(): {
      url: string | undefined;
      hostApiKey: string | undefined;
    } | null {
      return rampConfig[this.ethNetwork];
    },
    ethNetwork(): string {
      return this.$store.getters["zk-provider/network"];
    },
    banxaConfig(): {
      url: string;
    } | null {
      return banxaConfig[this.ethNetwork];
    },
    moonpayConfig(): {
      url: string;
      apiPublicKey: string;
    } | null {
      return moonpayConfig[this.ethNetwork];
    },
    address(): string {
      return this.$store.getters["zk-account/address"];
    },
    isMainnet(): boolean {
      return this.ethNetwork === "mainnet";
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
    isOrbiterSupported(): boolean {
      return this.isMainnet;
    },
    isUtorgSupported(): boolean {
      return true;
      return this.isMainnet;
    },
  },
  mounted() {
    this.errorText = "";
    this.$accessor.closeActiveModal();
  },
  data() {
    return {
      errorText: "",
    };
  },
  methods: {
    redirectURL(full: boolean = true): string {
      return full ? `${window.location.origin}/account` : "/account";
    },
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
          this.redirectURL()
        )}&returnUrlOnFailure=${encodeURIComponent(this.redirectURL())}`,
        "_blank"
      );
    },
    buyWithOrbiter() {
      if (!this.isOrbiterSupported) {
        return;
      }
      this.$analytics.track("click_on_buy_with_orbiter");
      window.open(`https://www.orbiter.finance/?referer=zksync&dests=zksync&fixed=1`);
    },
    buyWithUtorg() {
      if (!this.isUtorgSupported) {
        return;
      }
      this.$analytics.track("click_on_buy_with_utorg");
      window.open(`https://app-stage.utorg.pro/direct/3_prO23xXW/${this.address}/`);
    },
    async buyWithMoonpay(): Promise<void> {
      if (!this.isMoonpaySupported) {
        return;
      }

      try {
        this.$analytics.track("click_on_moonpay");
        const availableZksyncCurrencies = ["ETH_ZKSYNC", "USDC_ZKSYNC", "DAI_ZKSYNC", "USDT_ZKSYNC"];
        const url = `${this.moonpayConfig!.url}?apiKey=${this.moonpayConfig!.apiPublicKey}&walletAddress=${encodeURIComponent(
          this.address
        )}&defaultCurrencyCode=ETH_ZKSYNC&showOnlyCurrencies=${availableZksyncCurrencies.join(",")}&showAllCurrencies=0&redirectURL=${encodeURIComponent(this.redirectURL())}`;

        const body = JSON.stringify({
          pubKey: this.moonpayConfig?.apiPublicKey,
          originalUrl: url,
          ethNetwork: this.ethNetwork,
        });
        const response = await fetch("/api/moonpaySign", {
          method: "POST",
          cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
          headers: {
            "Sec-Fetch-Site": "none",
            "Content-Type": "application/json; charset=utf-8",
          },
          body,
        });
        console.warn(response);
        if (!response.ok) {
          console.warn(response);
          throw new Error(response.statusText);
        }
        const responseData = await response.json();
        /**
         * Success processing
         */
        if (!responseData?.signedUrl) {
          throw new Error("signedUrl is missing");
        }
        window.open(responseData!.signedUrl, "_blank");
      } catch (error) {
        console.warn(error);
        this.errorText = error.message || "There was an error during Moonpay Deposit initialization. Please try once again.";
        this.$accessor.openModal("DepositError");
      }
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
.moonpayProvider,
.orbiterProvider,
.utorgProvider {
  display: flex;
  align-items: center;
  &.orbiterProvider svg {
    height: 21px;
  }

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