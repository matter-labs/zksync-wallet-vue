<template>
  <i-button :disabled="!isRampSupported" link class="buy-with-ramp-button" @click="buyWithRamp">
    Buy Crypto with
    <label><img class="mr-2" src="/RampLogo.svg" alt="Ramp" />Ramp</label>
  </i-button>
</template>

<script lang="ts">
import Vue from "vue";
import { RampInstantSDK } from "@ramp-network/ramp-instant-sdk";
import theme from "@matterlabs/zksync-nuxt-core/utils/theme";
import { rampConfig } from "@/utils/config";

export default Vue.extend({
  data() {
    return {
      theme: theme.getUserTheme(),
    };
  },
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
    isDarkTheme(): boolean {
      return this.theme === "dark";
    },
  },
  methods: {
    buyWithRamp() {
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
}

body.-dark {
  .buy-with-ramp-button {
    label {
      color: #f8f9fa;
    }
  }
}
</style>
