<template>
  <img class="userImg" :src="walletImg" alt="avatar">
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
      return blockie(this.wallet);
    },
  },
};
</script>
