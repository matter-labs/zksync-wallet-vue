<template>
  <div :class="{ 'disabled': !enabled }" @click="proceed">
    <img src="@/static/images/providers/okex.png" alt="Okex" width="69">
  </div>
</template>
<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "ProviderOkex",
  props: {
    enabled: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    proceed (): void {
      if (!this.enabled) {
        this.$emit("providerError", "Provider Okex will be available soon");
        return;
      }
      this.$analytics.track("click_on_buy_with_okex");
    }
  }
});
</script>
<style lang="scss" scoped>
.providerOption {
  &.disabled {
    border-color: transparentize($color: #eeeeee, $amount: 0.7);

    img {
      opacity: 0.3;
      filter: contrast(0.1);
    }
  }

  &:not(.disabled):hover {
    border-color: #5d65b9 !important;
    cursor: pointer;
  }
}
</style>