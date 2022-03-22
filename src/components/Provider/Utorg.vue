<template>
  <div :class="{ disabled: disabled }" class="providerOption" @click="proceed">
    <block-svg-utorg/>
  </div>
</template>
<script lang="ts">
import { utorgConfig } from "@/utils/config";
import Vue from "vue";

export default Vue.extend({
  name: "ProviderUtorg",
  props: {
    enabled: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    utorgConfig(): {
      url: string;
      sid: string;
    } | null {
      return utorgConfig[this.$store.getters["zk-provider/network"]];
    },
    disabled(): boolean {
      return !this.enabled || !this.isSupported;
    },
    isSupported(): boolean {
      return !!this.utorgConfig;
    }
  },
  methods: {
    proceed(): void {
      if (!this.enabled) {
        this.$emit("providerError", "Provider Utorg will be available soon");
        return;
      }
      this.$analytics.track("click_on_buy_with_utorg");
      window.open(`${this.utorgConfig!.url}/direct/${this.utorgConfig!.sid}/${this.$store.getters["zk-account/address"]}/`);
    }
  }
});
</script>
<style lang="scss" scoped>
.providerOption {
  &.disabled {
    img {
      filter: contrast(0.1);
    }
  }

  &:not(.disabled):hover {
    border-color: #5d65b9 !important;
    cursor: pointer;
  }
}
</style>