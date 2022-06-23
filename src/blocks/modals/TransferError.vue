<template>
  <i-modal v-model="opened" size="md">
  <template #header>Transfer failed</template>
    <p>{{ errorText }}</p>
    <i-button class="_margin-top-1" block size="lg" variant="secondary" @click="opened = false">
      Ok
    </i-button>
  </i-modal>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "TransferError",
  props: {
    errorText: {
      type: String,
      default: undefined,
      required: false
    },
  },
  computed: {
    opened: {
      set(val: false | string): void {
        if (val === false) {
          this.$emit('close');
        }
      },
      get(): boolean {
        return !!this.errorText;
      },
    },
  },
});
</script>
