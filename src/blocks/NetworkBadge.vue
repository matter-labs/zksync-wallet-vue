<template>
  <i-badge v-if="!isMainnet" variant="primary" data-cy="network_logo">
    <small class="version">{{ network }}</small>
  </i-badge>
</template>
<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "NetworkBadge",
  computed: {
    isMainnet(): boolean {
      return this.$store.getters["zk-provider/network"] === "mainnet";
    },
    network(): string {
      return this.$store.getters["zk-provider/network"];
    },
  },
});
</script>
