<template>
  <i-badge v-if="!isProduction" variant="primary">
    <small class="version">{{ network }}</small>
  </i-badge>
</template>

<script lang="ts">
import { ETHER_PRODUCTION } from "@/plugins/build";
import Vue from "vue";
export default Vue.extend({
  name: "NetworkBadge",
  computed: {
    isProduction(): boolean {
      return ETHER_PRODUCTION;
    },
    network(): string {
      return this.$accessor.config.network.name;
    },
  },
});
</script>
