<template>
  <div class="walletPage dappPageWrapper">
    <block-balances>
      <wallet-address class="clickablePicture _margin-bottom-1" :wallet="walletAddress" @clickPicture="openAccountModal()" />
    </block-balances>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  data() {
    return {
      walletInfoModal: false,
    };
  },
  computed: {
    walletAddress() {
      return this.$accessor.account.address;
    },
  },
  methods: {
    openAccountModal() {
      this.$accessor.setAccountModalState(true);
    },
  },
});
</script>
