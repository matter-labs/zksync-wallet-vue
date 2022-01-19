<template>
  <i-badge v-if="version" variant="secondary" class="system-info">
    <i-popover size="sm" class="system-env-popover" :trigger="['hover']">
      <span class="version">v.{{ version }}</span>
      <template slot="header">Environment details</template>
      <template slot="body">
        <span class="env-details">
          <v-icon name="ri-npmjs-fill" />
          zkSync v.{{ zkLibVersion }}
        </span>
        <span class="env-details">
          <v-icon name="ri-reserved-fill" />
          zkSync API <code class="_padding-y-0" data-cy="environment_details_api">{{ zkApiBase }}</code>
        </span>
        <span class="env-details">
          <v-icon name="ri-reserved-fill" />
          Ethereum env <code class="_padding-y-0" data-cy="environment_details_network">{{ netName }}</code>
        </span>
      </template>
    </i-popover>
    <a :href="githubLink" class="revision _background-gray-40" target="_blank">
      <v-icon name="ri-github-fill" />
      {{ revision }}
    </a>
  </i-badge>
</template>
<script lang="ts">
import Vue from "vue";
import { ZkConfig } from "@matterlabs/zksync-nuxt-core/types";
import { GIT_REVISION_SHORT, VERSION, ZK_LIB_VERSION } from "@/utils/config";

export default Vue.extend({
  computed: {
    config(): ZkConfig {
      return this.$store.getters["zk-onboard/config"];
    },
    netName(): string {
      return this.config.ethereumNetwork.name;
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
      return this.config.zkSyncNetwork.api;
    },
  },
});
</script>
