<template>
  <div class="walletPage">
    <balances>
      <wallet-address class="clickablePicture _margin-bottom-1" :wallet="walletAddress" @clickPicture="openAccountModal()" />
    </balances>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import balances from "@/blocks/Balances.vue";
export default Vue.extend({
  components: {
    balances,
  },
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
