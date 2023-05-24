<template>
  <div class="ethereumTransferProvider" @click="proceed">
    <label>
      <span>Transfer to Ethereum</span>
      <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path class="letter ethereumLogo" d="M12.4543 16.9744L6.31494 13.3513L12.4506 22.0006L18.5931 13.3513L12.4506 16.9744H12.4543ZM12.5456 2L6.40869 12.1856L12.5456 15.815L18.6849 12.1894L12.5456 2Z" />
      </svg>
    </label>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "EthereumTransferProvider",
  methods: {
    proceed() {
      this.$analytics.track("click_on_transfer_with_ethereum");
      return this.$router.push("/transaction/withdraw");
    },
  },
});
</script>

<style lang="scss">
.inkline.-dark .ethereumTransferProvider .ethereumLogo {
  fill: lighten($color: $lightViolet, $amount: 5) !important;
}
</style>