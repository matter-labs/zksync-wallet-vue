<template>
  <div :class="{ disabled: !enabled }" @click="proceed">
    <img src="@/static/images/providers/bybit.png" alt="Bybit" width="61" />
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
  methods: {
    proceed(): void {
      if (!this.enabled) {
        this.$emit("providerError", "Provider Bybit will be available soon");
        return;
      }
      this.$analytics.track("click_on_buy_with_bybit");
    },
  },
});
</script>
<style lang="scss" scoped>
.providerOption {
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
