<template>
  <i-modal v-model="opened" size="md" class="networkSwitchModal" data-cy="network_switch_modal">
    <template slot="header">Network Configuration</template>
    <ul class="network-list">
      <li v-for="zkNetworkName in options" :key="zkNetworkName" :data-cy="`network_switch_${zkNetworkName}`" class="network-list-item" @click="changeNetworkConfig(zkNetworkName)">
        <span>
          <v-icon v-if="zkNetworkName === network" class="selected" name="ri-check-line" />
        </span>
        <span>{{ zkNetworkName }} </span>
      </li>
    </ul>
  </i-modal>
</template>

<script lang="ts">
import Vue from "vue";
import { ZkNetwork } from "matter-dapp-module/types";
import { zkSyncNetworkConfig } from "matter-dapp-module/utils/config";

export default Vue.extend({
  name: "NetworkSwitch",
  computed: {
    options() {
      return Object.keys(zkSyncNetworkConfig).filter((zkNetworkName) => zkNetworkName !== "localhost");
    },
    network() {
      return this.$store.getters["zk-provider/network"];
    },
    opened: {
      set(val): void {
        if (val === false) {
          this.$accessor.closeActiveModal();
        }
      },
      get(): boolean {
        return this.$accessor.currentModal !== null && this.$accessor.currentModal === "NetworkSwitch";
      },
    },
  },
  methods: {
    changeNetworkConfig(networkName: ZkNetwork) {
      this.$store.dispatch("zk-provider/changeNetwork", networkName);
      this.$accessor.closeActiveModal();
    },
  },
});
</script>
