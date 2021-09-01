<template>
  <div class="transactionBlock">
    <!-- Choose token -->
    <i-modal v-model="chooseTokenModal" size="md">
      <template slot="header">Choose token</template>
      <choose-token :tokens-type="mainToken" @chosen="$emit('token-chosen', $event)" />
    </i-modal>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { ZkTransactionMainToken } from "matter-dapp-ui/types";
export default Vue.extend({
  data() {
    return {
      chooseTokenModal: true,
    };
  },
  computed: {
    mainToken(): ZkTransactionMainToken {
      return this.$store.getters["zk-transaction/mainToken"];
    },
  },
});
</script>
