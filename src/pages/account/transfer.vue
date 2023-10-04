<template>
  <div class="providers-page dappPageWrapper">
    <div class="providers-page-tile tileBlock">
      <h3 class="tileHeadline withBtn">
        <nuxt-link to="/account" class="_icon-wrapped -rounded -sm returnBtn _display-flex">
          <v-icon name="ri-arrow-left-line" scale="1" />
        </nuxt-link>
        Transfer
      </h3>
      <section class="tileSubContainer">
        <h4 class="tileSmallHeadline">Transfer</h4>
        <div class="secondaryText small _margin-bottom-05">
          You can send your assets within the zkSync lite network or send them to Ethereum
          <span class="networkName">{{ network }}</span> network
        </div>
        <TransferProviders :providers="['zksync', 'ethereum']" />
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { ZkEthereumNetworkName } from "@matterlabs/zksync-nuxt-core/types";

export default Vue.extend({
  computed: {
    network(): ZkEthereumNetworkName {
      return this.$store.getters["zk-provider/network"];
    },
  },
  mounted() {
    this.$analytics.track("visit_transfer");
  },
});
</script>
<style lang="scss" scoped>
.networkName {
  text-transform: capitalize;
}
</style>
