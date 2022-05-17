<template>
  <div @click="proceed">
    <block-logo class="providerZkLogo" :hide-network="true" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "ProviderZkSync",
  methods: {
    proceed() {
      this.$analytics.track("click_on_buy_with_zksync");
      return this.$router.push("/transaction/deposit");
    },
  },
});
</script>

<style lang="scss">
.providerZkLogo {
  width: 90%;
  max-width: 118px;
  padding: 0;

  svg {
    width: 100%;
    margin-right: 0 !important;
    max-width: initial !important;
  }
}
</style>
