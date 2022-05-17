<template>
  <div :class="{ disabled: !isSupported }" @click="proceed">
    <img src="/images/providers/okex.png" alt="Okex" width="69" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { ZkEthereumNetworkName } from "@matterlabs/zksync-nuxt-core/types";

export default Vue.extend({
  name: "ProviderOkex",
  computed: {
    network(): ZkEthereumNetworkName {
      return this.$store.getters["zk-provider/network"];
    },
    isSupported(): boolean {
      return this.network === "mainnet";
    },
  },
  methods: {
    proceed() {
      this.$emit("providerError", `Provider 0kex is not yet supported`);
      this.$analytics.track("click_on_buy_with_okex");
    },
  },
});
</script>

<style lang="scss" scoped>
svg {
  width: 65%;
}
</style>
