<template>
  <img class="userImg" :src="walletImg" alt="avatar" @click="$emit('click')" />
</template>

<script type="ts">
import blockie from "ethereum-blockies-base64";
import Vue from "vue";

export default Vue.extend({
  props: {
    wallet: {
      type: String,
      default: "",
      required: true,
    },
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
