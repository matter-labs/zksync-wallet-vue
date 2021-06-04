<template>
  <i-modal v-model="opened" size="md">
    <template slot="header">Content Hash</template>
    <p>Content Hash is bla bla bla. Bla bla bla.</p>
  </i-modal>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "ContentHash",
  computed: {
    opened: {
      set(val): void {
        if (val === false) {
          this.$accessor.closeActiveModal();
        }
      },
      get(): boolean {
        return this.$accessor.currentModal !== null && this.$accessor.currentModal === "ContentHash";
      },
    },
  },
});
</script>
