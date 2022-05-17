<template>
  <div :class="{ disabled: !isSupported }" @click="proceed">
    <label><img src="/images/providers/zigzag.png" alt="ZigZag" />ZigZag</label>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { ZkEthereumNetworkName } from "@matterlabs/zksync-nuxt-core/types";

export default Vue.extend({
  name: "ProviderZigZag",
  computed: {
    network(): ZkEthereumNetworkName {
      return this.$store.getters["zk-provider/network"];
    },
    isSupported(): boolean {
      return this.network === "mainnet";
    },
  },
  methods: {
    proceed(): void {
      if (!this.isSupported) {
        this.$emit("providerError", `Provider ZigZag is not supported for the “${this.network}” network`);
        return;
      }
      this.$analytics.track("click_on_buy_with_zigzag");
      window.open("https://trade.zigzag.exchange/bridge", "_blank");
    },
  },
});
</script>
