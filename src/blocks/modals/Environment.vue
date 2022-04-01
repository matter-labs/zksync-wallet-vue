<template>
  <i-modal v-if="$config.git.version" v-model="opened" size="md">
    <template #header>Environment</template>
    <div class="modalFooterBtn">
      <v-icon name="ri-npmjs-fill" />
      <span>zkSync:</span>
      <strong>{{ $config.zksyncVersion }}</strong>
    </div>
    <div class="modalFooterBtn">
      <v-icon name="ri-reserved-fill" />
      <span>zkSync API:</span>
      <strong>{{ zkApiBase }}</strong>
    </div>
    <div class="modalFooterBtn">
      <v-icon name="ri-reserved-fill" />
      <span>Ethereum env:</span>
      <strong>{{ netName }}</strong>
    </div>
  </i-modal>
</template>

<script lang="ts">
import Vue from "vue";
import { ZkConfig } from "@matterlabs/zksync-nuxt-core/types";

export default Vue.extend({
  name: "Environment",
  computed: {
    opened: {
      set(val): void {
        if (val === false) {
          this.$accessor.closeActiveModal();
        }
      },
      get(): boolean {
        return this.$accessor.currentModal !== null && this.$accessor.currentModal === "environment";
      },
    },
    config(): ZkConfig {
      return this.$store.getters["zk-onboard/config"];
    },
    netName(): string {
      return this.config.ethereumNetwork.name;
    },
    githubLink(): string | undefined {
      return `https://github.com/matter-labs/zksync-wallet-vue/commit/${this.$config.git.revision}`;
    },
    zkApiBase(): string {
      return this.config.zkSyncNetwork.api;
    },
  },
});
</script>
