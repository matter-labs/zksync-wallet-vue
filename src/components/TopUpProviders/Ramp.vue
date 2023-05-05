<template>
  <div :class="{ disabled: !isSupported }" @click="proceed">
    <label>
      <img src="/images/providers/RampLogo.svg" alt="Ramp" />
      Ramp
    </label>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Address } from "zksync/build/types";
import { RampInstantSDK } from "@ramp-network/ramp-instant-sdk";
import { ZkEthereumNetworkName } from "@matterlabs/zksync-nuxt-core/types";

const rampConfig = {
  hostAppName: "zkSync Wallet",
  swapAsset: "ZKSYNC_*",
  url: undefined, // use default URL
  hostApiKey: process.env.RAMP_MAINNET_HOST_API_KEY,
};

export default Vue.extend({
  name: "ProviderRamp",
  computed: {
    network(): ZkEthereumNetworkName {
      return this.$store.getters["zk-provider/network"];
    },
    isSupported(): boolean {
      return this.network === "mainnet";
    },
    address(): Address {
      return this.$store.getters["zk-account/address"];
    },
  },
  methods: {
    proceed() {
      if (!this.isSupported) {
        this.$emit("providerError", `Provider Ramp is not supported for the “${this.network}” network`);
        return;
      }
      this.$analytics.track("click_on_buy_with_ramp");

      new RampInstantSDK({
        variant: "hosted-auto",
        hostLogoUrl: window.location.origin + "/favicon.png",
        userAddress: this.address,
        ...rampConfig,
      }).show();
    },
  },
});
</script>
