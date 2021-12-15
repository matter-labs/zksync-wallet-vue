<template>
  <i-button :disabled="!isRampSupported" link class="buy-with-ramp-button" @click="buyWithRamp">
    Buy Crypto with
    <label><img class="ramp-logo" src="/RampLogo.svg" alt="Ramp" />Ramp</label>
  </i-button>
</template>

<script lang="ts">
import Vue from "vue";
import { RampInstantSDK } from "@ramp-network/ramp-instant-sdk";
import { rampConfig } from "@/utils/config";

export default Vue.extend({
  computed: {
    config(): {
      url: string | undefined;
      hostApiKey: string | undefined;
    } | null {
      return rampConfig[this.$store.getters["zk-provider/network"]];
    },
    address(): string {
      return this.$store.getters["zk-account/address"];
    },
    isRampSupported(): boolean {
      return !!this.config;
    },
  },
  methods: {
    buyWithRamp() {
      this.$analytics.track("click_on_buy_with_ramp");

      if (!this.isRampSupported) {
        throw new Error("Ramp is not supported on this environment.");
      }
      new RampInstantSDK({
        hostAppName: "zkSync Wallet",
        hostLogoUrl: window.location.origin + "/favicon-dark.png",
        variant: "hosted-auto",
        swapAsset: "ZKSYNC_*",
        userAddress: this.address,
        ...this.config,
      }).show();
    },
  },
});
</script>

<style lang="scss" scoped>
.buy-with-ramp-button {
  label {
    font-weight: bold;
    margin: 0 0 0 3px;
    display: inline-flex;
    align-items: center;
    color: #22272f;
    &:hover {
      cursor: pointer;
    }
  }

  .ramp-logo {
    margin-right: 2px;
  }
}

body.-dark {
  .buy-with-ramp-button {
    label {
      color: #f8f9fa;
    }
  }
}
</style>
