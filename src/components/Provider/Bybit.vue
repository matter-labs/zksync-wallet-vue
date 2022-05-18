<template>
  <div :class="{ disabled }" @click="proceed">
    <img v-if="isDark" src="@/static/images/providers/bybit-white.svg" alt="ByBit" />
    <img v-else src="@/static/images/providers/bybit-dark.svg" alt="ByBit" />
  </div>
</template>
<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "ProviderBybit",
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
    isDark(): boolean {
      return this.$inkline.config.variant === "dark";
    },
  },
  methods: {
    proceed(): Window | null | void {
      if (this.disabled) {
        this.$emit("providerError", "Provider Bybit will be available soon");
        return;
      }
      this.$analytics.track("click_on_buy_with_bybit");
      return window.open(`https://www.bybit.com/en_US/fiat/purchase/crypto`, "_blank");
    },
  },
});
</script>
<style lang="scss" scoped>
.providerOption {
  img {
    width: 3.8rem;
  }

  &.disabled {
    border-color: transparentize($color: #eeeeee, $amount: 0.7);

    img {
      opacity: 0.3;
    }
  }

  &:not(.disabled):hover {
    border-color: #5d65b9 !important;
    cursor: pointer;
  }
}
</style>
