<template>
  <i-modal v-model="opened" class="wrongNetworkModal" size="md">
    <template slot="header">Error requesting zkSync provider</template>
    <div>
      <div class="_padding-bottom-1">
        Error requesting zkSync <b>{{ network }}</b> provider. Please check your internet connection and try again later.
      </div>
      <div class="_padding-bottom-1">
        {{ providerError }}
      </div>
    </div>
  </i-modal>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "RequestingProviderError",
  computed: {
    network(): string {
      return this.$store.getters["zk-provider/network"];
    },
    providerError(): string | undefined {
      return this.$store.getters["zk-provider/providerRequestingError"];
    },
    opened: {
      set(val): void {
        if (val === false) {
          this.$store.commit("zk-provider/setProviderRequestingError", undefined);
        }
      },
      get(): boolean {
        return !!this.$store.getters["zk-provider/providerRequestingError"];
      },
    },
  },
});
</script>
