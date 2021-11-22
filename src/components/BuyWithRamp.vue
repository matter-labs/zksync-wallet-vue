<template>
  <i-button :disabled="!isRampSupported" link @click="buyWithRamp"> Buy with Ramp Instant<v-icon class="" name="ri-arrow-right-up-line" scale="0.75" /> </i-button>
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
