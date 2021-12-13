<template>
  <div class="walletPage dappPageWrapper">
    <block-balances>
      <wallet-address class="clickablePicture _margin-bottom-1" :wallet="walletAddress" @clickPicture="openAccountModal()" />
    </block-balances>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Address } from "zksync/build/types";
export default Vue.extend({
  data() {
    return {
      walletInfoModal: false,
    };
  },
  computed: {
    walletAddress(): Address {
      return this.$store.getters["zk-account/address"];
    },
  },
  mounted() {
    this.$analytics.track("visit_home");
  },
  methods: {
    openAccountModal(): void {
      this.$accessor.setAccountModalState(true);
    },
  },
});
</script>
