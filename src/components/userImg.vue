<template>
  <img class="userImg" :src="walletImg" alt="avatar" @click="$emit('click')" />
</template>

<script lang="ts">
import { Address } from "zksync/build/types";
import blockie from "ethereum-blockies-base64";
import Vue, { PropOptions } from "vue";

export default Vue.extend({
  props: {
    wallet: {
      type: String,
      default: "",
      required: true,
    } as PropOptions<Address>,
  },
  computed: {
    walletImg() {
      if (!this.wallet) {
        return "";
      }
      return blockie(this.wallet);
    },
  },
});
</script>
