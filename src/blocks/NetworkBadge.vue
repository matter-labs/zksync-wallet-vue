<template>
  <div class="badge-wrapper">
    <network-switch />
    <i-badge v-if="!isProduction" variant="primary">
      <small class="version" @click="openNetworkSwitchModal"
        >{{ network }}
        <v-icon name="ri-arrow-down-s-line" />
      </small>
    </i-badge>
  </div>
</template>
<script lang="ts">
import { ETHER_PRODUCTION } from "@/plugins/build";
import Vue from "vue";
import NetworkSwitch from "@/blocks/modals/NetworkSwitch.vue";

export default Vue.extend({
  name: "NetworkBadge",
  components: {
    NetworkSwitch,
  },
  computed: {
    isProduction(): boolean {
      return ETHER_PRODUCTION;
    },
    network(): string {
      return this.$accessor.config.network.name;
    },
  },
  methods: {
    openNetworkSwitchModal() {
      return this.$accessor.openModal("NetworkSwitch");
    },
  },
});
</script>
