<template>
  <img class="userImg" :src="walletImg" alt="avatar" @click="$emit('click')" />
</template>

<script>
import blockie from "ethereum-blockies-base64";

export default {
  props: {
    wallet: {
      type: String,
      default: "",
      required: true,
    },
  },
  computed: {
    walletImg: function () {
      if (!this.wallet) {
        return "";
      }
      return blockie(this.wallet);
    },
  },
};
</script>
