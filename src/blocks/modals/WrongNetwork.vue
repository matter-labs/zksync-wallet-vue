<template>
  <i-modal v-model="opened" class="wrongNetworkModal" size="md">
    <template #header>Wrong network</template>
    <div>
      <div class="_padding-bottom-1">
        You are on the wrong network. Please switch your wallet to <b>{{ network }}</b> to continue.
      </div>
      <div class="_padding-bottom-1 text-sm">
        Some wallets may not support changing networks. If you can not change networks in your wallet you may consider
        switching to a different wallet.
      </div>
    </div>
  </i-modal>
</template>

<script lang="ts">
import { ZkConfig } from "@matterlabs/zksync-nuxt-core/types";
import Vue from "vue";

export default Vue.extend({
  name: "WrongNetwork",
  computed: {
    network(): string {
      return (this.$store.getters["zk-onboard/config"] as ZkConfig).ethereumNetwork.name;
    },
    opened: {
      set(val): void {
        if (val === false) {
          this.$store.dispatch("zk-onboard/rejectNetworkChange");
        }
      },
      get(): boolean {
        return this.$store.getters["zk-onboard/wrongNetwork"];
      },
    },
  },
});
</script>

<style lang="scss">
.wrongNetworkModal .text-sm {
  font-size: 13px;
}
</style>
