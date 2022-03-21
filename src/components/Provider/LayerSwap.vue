<template>
  <div :class="{ 'disabled': !enabled }" @click="proceed">
    <img src="@/static/images/providers/layer-swap-light.svg" v-if="isDarkTheme" alt="LayerSwap">
    <img src="@/static/images/providers/layer-swap.svg" v-else alt="LayerSwap">
  </div>
</template>
<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "ProviderLayerSwap",
  props: {
    enabled: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    isDarkTheme (): boolean {
      return this.$inkline.config.variant === "dark";
    }
  },
  methods: {
    proceed (): void {
      if (!this.enabled) {
        this.$emit("providerError", "Provider LayerSwap will be available soon");
        return;
      }
      this.$analytics.track("click_on_buy_with_layerswap");
      window.open(`https://www.layerswap.io/?referer=zksync`, "_blank");
    }
  }
});
</script>
<style lang="scss" scoped>
.disabled {
  img {
    opacity: 0.3;
  }
}
</style>