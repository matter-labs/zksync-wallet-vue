<template>
  <div @click="proceed">
    <label>
      <span>Transfer to zkSync lite</span>
      <img src="/images/logo-no-letters.svg" alt="zkSync Transfer" />
    </label>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "ZkSyncTransferProvider",
  methods: {
    proceed() {
      this.$analytics.track("click_on_transfer_with_ethereum");
      return this.$router.push("/transaction/transfer");
    },
  },
});
</script>
