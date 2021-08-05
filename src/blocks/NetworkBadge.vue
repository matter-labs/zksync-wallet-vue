<template>
  <i-badge v-if="!isMainnet" variant="primary">
    <small class="version">{{ network }}</small>
  </i-badge>
</template>
<script lang="ts">
import { ETHER_PRODUCTION, ZK_NETWORK } from "@/plugins/build";
import Vue from "vue";

export default Vue.extend({
  name: "NetworkBadge",
  computed: {
    isMainnet(): boolean {
      return ETHER_PRODUCTION;
    },
    network(): string {
      return ZK_NETWORK;
    },
  },
});
</script>
