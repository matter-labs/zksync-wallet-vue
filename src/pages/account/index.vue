<template>
  <div class="walletPage">
    <div class="accountBlock tileBlock">
      <wallet-address class="clickablePicture" :wallet="walletAddress" @clickPicture="openAccountModal()" />
    </div>
    <balances />
    <div class="mobileOnly" style="height: 95px"></div>
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
