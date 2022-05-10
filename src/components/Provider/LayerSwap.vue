<template>
  <div :class="{ disabled }" @click="proceed">
    <img v-if="isDarkTheme" src="@/static/images/providers/layer-swap-light.svg" alt="LayerSwap" />
    <img v-else src="@/static/images/providers/layer-swap.svg" alt="LayerSwap" />
  </div>
</template>
<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "ProviderLayerSwap",
  props: {
    enabled: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    network(): string {
      return this.$store.getters["zk-provider/network"];
    },
    disabled(): boolean {
      return !this.enabled || !this.isSupported;
    },
    isSupported(): boolean {
      return this.network === "mainnet";
    },
    isDarkTheme(): boolean {
      return this.$inkline.config.variant === "dark";
    },
  },
  methods: {
    proceed(): void {
      if (this.disabled) {
        this.$emit("providerError", "Provider LayerSwap will be available soon");
        return;
      }
      this.$analytics.track("click_on_buy_with_layerswap");
      window.open(
        `https://www.layerswap.io/?referer=zksync&destNetwork=ZKSYNC_MAINNET&lockNetwork=true&addressSource=zksyncweb&lockAddress=true&destAddress=${this.$store.getters["zk-account/address"]}`,
        "_blank"
      );
    },
  },
});
</script>
<style lang="scss" scoped>
.disabled {
  img {
    opacity: 0.3;
  }
}
</style>
