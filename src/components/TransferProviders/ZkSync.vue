<template>
  <div @click="proceed">
    <label>
      <span>Transfer to zkSync</span>
      <svg width="42" height="24" viewBox="0 0 42 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M42 12.0022L30.0856 0.00439453V8.79112L18.2559 17.5885L30.0856 17.5968V24L42 12.0022Z" fill="#4E529A"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M0 11.9978L11.9143 23.9956V15.2796L23.7441 6.41147L11.9143 6.40325V0L0 11.9978Z" fill="#8C8DFC"/>
      </svg>
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
