<template>
  <i-badge v-if="!isMainnet" variant="primary">
    <small class="version">{{ network }}</small>
  </i-badge>
</template>
<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "NetworkBadge",
  computed: {
    isMainnet(): boolean {
      return process.env.network === "mainnet";
    },
    network() {
      return process.env.network;
    },
  },
});
</script>
