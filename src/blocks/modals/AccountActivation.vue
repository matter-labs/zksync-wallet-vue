<template>
  <i-modal v-model="opened" size="md">
    <template slot="header">Account Activation</template>
    <p>
      Activation is required single-time payment to set the signing key associated with the account.<br />Without it no operation can be authorized by your corresponding account.
    </p>
  </i-modal>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "AccountActivation",
  computed: {
    opened: {
      set(val): void {
        if (val === false) {
          this.$accessor.closeActiveModal();
        }
      },
      get(): boolean {
        return this.$accessor.currentModal !== null && this.$accessor.currentModal === "AccountActivation";
      },
    },
  },
});
</script>
