<template>
  <i-modal v-model="opened" class="wrongNetworkModal" size="md">
    <template #header>Login error</template>
    <div>
      <div class="_padding-bottom-1 errorText">
        {{ error }}
      </div>
    </div>
  </i-modal>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "WrongNetwork",
  computed: {
    error(): string {
      return this.$store.getters["zk-onboard/error"];
    },
    opened: {
      set(val): void {
        if (val === false) {
          this.$store.commit("zk-onboard/setError", "");
        }
      },
      get(): boolean {
        return !!this.error;
      },
    },
  },
});
</script>
