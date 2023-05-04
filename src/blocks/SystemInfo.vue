<template>
  <i-badge v-if="$config.git.version" variant="secondary" class="system-info">
    <i-popover size="sm" class="system-env-popover" :trigger="['hover']">
      <span class="version">v.{{ $config.git.version }}</span>
      <template #header>Environment details</template>
      <template #body>
        <span class="env-details">
          <v-icon name="ri-npmjs-fill" />
          zkSync v.{{ $config.zksyncVersion }}
        </span>
        <span class="env-details">
          <v-icon name="ri-reserved-fill" />
          zkSync API
          <code class="_padding-y-0" data-cy="environment_details_api">{{ config.zkSyncNetwork.api }}</code>
        </span>
        <span class="env-details">
          <v-icon name="ri-reserved-fill" />
          Ethereum env
          <code class="_padding-y-0" data-cy="environment_details_network">{{ config.ethereumNetwork.name }}</code>
        </span>
      </template>
    </i-popover>
    <a
      :href="`https://github.com/matter-labs/zksync-wallet-vue/commit/${$config.git.revision}`"
      class="revision _background-gray-40"
      target="_blank"
    >
      <v-icon name="ri-github-fill" />
      {{ $config.git.revision }}
    </a>
  </i-badge>
</template>
<script lang="ts">
import Vue from "vue";
import { ZkConfig } from "@matterlabs/zksync-nuxt-core/types";

export default Vue.extend({
  computed: {
    config(): ZkConfig {
      return this.$store.getters["zk-onboard/config"];
    },
  },
});
</script>
