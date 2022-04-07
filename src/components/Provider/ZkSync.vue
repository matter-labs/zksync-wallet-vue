<template>
  <div :class="{ disabled: !enabled }" class="providerOption" @click="proceed">
    <block-logo class="ProviderZkLogo" :hide-network="true" />
  </div>
</template>
<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "ProviderZkSync",
  props: {
    enabled: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  methods: {
    proceed() {
      if (!this.enabled) {
        this.$emit("providerError", "zkSync deposit is not supported");
        return;
      }
      this.$analytics.track("click_on_buy_with_zksync");
      return this.$router.push("/transaction/deposit");
    },
  },
});
</script>
<style lang="scss">
.providerOption {
  .ProviderZkLogo {
    width: 118px !important;
    height: auto !important;
    margin: 0 auto !important;
    padding: 0 !important;

    svg {
      width: 100%;
      height: auto;
    }
  }
}
</style>
