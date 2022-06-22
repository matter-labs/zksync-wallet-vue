<template>
  <i-badge v-if="version" variant="secondary" class="system-info">
    <i-popover size="sm" class="system-env-popover" :trigger="['hover']">
      <span class="version">v.{{ version }}</span>
      <template slot="header">Environment details</template>
      <template slot="body">
        <span class="env-details">
          <v-icon name="ri-npmjs-fill" />
          Explorer v.{{ zkLibVersion }}
        </span>
        <span class="env-details">
          <v-icon name="ri-reserved-fill" />
          RIF Aggregation API <code class="_padding-y-0">{{ zkApiBase }}</code>
        </span>
        <span class="env-details">
          <v-icon name="ri-reserved-fill" />
          RSK env <code class="_padding-y-0">{{ netName }}</code>
        </span>
      </template>
    </i-popover>
    <div class="beta-tag errorText">BETA</div>
  </i-badge>
</template>
<script lang="ts">
import { GIT_REVISION_SHORT, VERSION, ZK_API_BASE, ZK_LIB_VERSION, ZK_NETWORK } from "@/plugins/build";
import Vue from "vue";

export default Vue.extend({
  computed: {
    netName(): string {
      return ZK_NETWORK;
    },
    zkLibVersion(): string {
      return ZK_LIB_VERSION;
    },
    version(): string {
      return VERSION;
    },
    githubLink(): string | undefined {
      return `https://github.com/matter-labs/zksync-wallet-vue/commit/${this.revision}`;
    },
    revision(): string {
      return GIT_REVISION_SHORT;
    },
    zkApiBase(): string {
      return ZK_API_BASE;
    },
  },
});
</script>
