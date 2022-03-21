<template>
  <div class="cryptoProviders">
    <div v-if="showProviders.ramp" :class="{ disabled: !isRampSupported }" class="providerOption rampProvider" @click="buyWithRamp">
      <label><img class="ramp-logo" src="/RampLogo.svg" alt="Ramp"/>Ramp</label>
    </div>
    <div v-if="showProviders.banxa" :class="{ disabled: !isBanxaSupported }" class="providerOption banxaProvider" @click="buyWithBanxa">
      <block-svg-banxa/>
    </div>
    <div v-if="showProviders.moonpay" :class="{ disabled: !isMoonpaySupported || !moonpay }" class="providerOption moonpayProvider" @click="buyWithMoonpay">
      <block-svg-moonpay/>
    </div>

    <provider-utorg v-if="showProviders.utorg" :enabled="utorg" class="providerOption" @providerError="setError"/>

    <provider-okex v-if="showProviders.okex" :enabled="okex" class="providerOption" @providerError="setError"/>
    <provider-bybit v-if="showProviders.bybit" :enabled="bybit" class="providerOption" @providerError="setError"/>

    <provider-layer-swap v-if="showProviders.layerSwap" :enabled="layerSwap" class="providerOption" @providerError="setError"/>
    <provider-orbiter v-if="showProviders.orbiter" :enabled="orbiter" class="providerOption orbiterProvider" @providerError="setError"/>
    <provider-zk-sync v-if="showProviders.zksync" :enabled="true" class="providerOption zkSync"/>
    <block-modals-deposit-error :errorText="errorText"/>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import { RampInstantSDK } from "@ramp-network/ramp-instant-sdk";
import { banxaConfig, moonpayConfig, rampConfig } from "@/utils/config";

export default Vue.extend({
  name: "Providers",
  props: {
    ramp: {
      type: Boolean,
      default: true,
      required: false
    },
    okex: {
      type: Boolean,
      default: false,
      required: false
    },
    bybit: {
      type: Boolean,
      default: false,
      required: false
    },
    banxa: {
      type: Boolean,
      default: true,
      required: false
    },
    moonpay: {
      type: Boolean,
      default: false,
      required: false
    },
    orbiter: {
      type: Boolean,
      default: true,
      required: false
    },
    utorg: {
      type: Boolean,
      default: false,
      required: false
    },
    layerSwap: {
      type: Boolean,
      default: true,
      required: false
    },
    showProviders: {
      type: Object as PropType<{
        banxa?: boolean; ramp?: boolean; orbiter?: boolean; moonpay?: boolean; zksync?: boolean; layerSwap?: boolean, okex?: boolean; bybit?: boolean;
        utorg?: boolean;
      }>,
      default: () => ({
        ramp: true,
        banxa: true
      }),
      required: false
    }
  },
  computed: {
    rampConfig (): {
      url: string | undefined;
      hostApiKey: string | undefined;
    } | null {
      return rampConfig[this.ethNetwork];
    },
    ethNetwork (): string {
      return this.$store.getters["zk-provider/network"];
    },
    banxaConfig (): {
      url: string;
    } | null {
      return banxaConfig[this.ethNetwork];
    },
    moonpayConfig (): {
      url: string;
      apiPublicKey: string;
    } | null {
      return moonpayConfig[this.ethNetwork];
    },
    address (): string {
      return this.$store.getters["zk-account/address"];
    },
    isRampSupported (): boolean {
      return !!this.rampConfig;
    },
    isBanxaSupported (): boolean {
      return !!this.banxaConfig;
    },
    isMoonpaySupported (): boolean {
      return !!this.moonpayConfig;
    }
  },
  mounted () {
    this.errorText = "";
    this.$accessor.closeActiveModal();
  },
  data () {
    return {
      errorText: ""
    };
  },
  methods: {
    setError (errorText: string): void {
      this.errorText = errorText;
    },
    redirectURL (full: boolean = true): string {
      return full ? `${window.location.origin}/account` : "/account";
    },
    buyWithRamp () {
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
        ...this.rampConfig
      }).show();
    },
    buyWithBanxa () {
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

    async buyWithMoonpay (): Promise<void> {
      if (!this.isMoonpaySupported || !this.moonpay) {
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
          ethNetwork: this.ethNetwork
        });
        const response = await fetch("/api/moonpaySign", {
          method: "POST",
          cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
          headers: {
            "Sec-Fetch-Site": "none",
            "Content-Type": "application/json; charset=utf-8"
          },
          body
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
    }
  }
});
</script>
<style lang="scss" scoped>
.cryptoProviders {
  margin-top: 1rem;
  display: grid;
  width: 100%;
  height: max-content;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-flow: row;
  grid-auto-rows: 52px;
  grid-gap: 11px;

  .providerOption {
    display: flex;
    justify-content: center;
    align-items: center;
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
.orbiterProvider {
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