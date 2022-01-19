<template>
  <i-modal v-model="opened" size="md">
    <template slot="header">Environment</template>
    <template slot="default">
      <div class="modalFooterBtn">
        <v-icon name="ri-npmjs-fill" />
        <span>zkSync:</span>
        <strong>{{ zkLibVersion }}</strong>
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
    </template>
  </i-modal>
</template>

<script lang="ts">
import Vue from "vue";
import { ZkConfig } from "@matterlabs/zksync-nuxt-core/types";
import { GIT_REVISION_SHORT, VERSION, ZK_LIB_VERSION } from "@/utils/config";

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
