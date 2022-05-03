<template>
  <div :class="{ disabled: disabled }" class="providerOption" @click="proceed">
    <label><img src="/zigzag.png" alt="ZigZag" />ZigZag</label>
  </div>
</template>
<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "ProviderZigZag",
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
  },
  methods: {
    proceed(): void {
      if (this.disabled) {
        this.$emit("providerError", `Provider Orbiter is not supported for the “${this.network}” network`);
        return;
      }
      this.$analytics.track("click_on_buy_with_zigzag");
      window.open("https://trade.zigzag.exchange/bridge", "_blank");
    },
  },
});
</script>
<style lang="scss" scoped>
.providerOption {
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
  img {
    height: 28px;
    margin-right: 7px;
  }
}
.inkline.-dark {
  .providerOption {
    label {
      color: #f8f9fa;
    }
  }
}
</style>
