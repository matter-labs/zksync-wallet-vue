<template>
  <div :class="{ 'disabled': disabled }" class="providerOption" @click="proceed">
    <block-svg-orbiter class="svgClass"/>
  </div>
</template>
<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "ProviderUtorg",
  props: {
    enabled: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    ethNetwork (): string {
      return this.$store.getters["zk-provider/network"];
    },
    disabled (): boolean {
      return !this.enabled || !this.isSupported;
    },
    isSupported (): boolean {
      return this.ethNetwork === "mainnet";
    }
  },
  methods: {
    proceed (): void {
      if (this.disabled) {
        this.$emit("providerError", `Provider Orbiter is not supported for the “${this.ethNetwork}” network`);
        return;
      }
      this.$analytics.track("click_on_buy_with_orbiter");
      window.open(`https://www.orbiter.finance/?referer=zksync&dests=zksync&fixed=1`, "_blank");
    }
  }
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

  .svgClass {
    height: 21px;
    width: auto;
    margin: 0 auto;
    transition: $transition1;
    transition-property: opacity;
    will-change: opacity;
  }
}

</style>