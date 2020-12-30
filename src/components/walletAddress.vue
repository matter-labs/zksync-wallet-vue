<template>
    <div class="walletContainer">
        <user-img :wallet="wallet" @click="$emit('clickPicture')" />
        <span class="walletValue walletAddress">{{wallet}}</span>
        <i-tooltip trigger="click">
            <i class="copy fas fa-copy" @click="copyAddress()"></i>
            <template slot="body">Copied!</template>
        </i-tooltip>
    </div>
</template>

<script>
import userImg from "@/components/userImg.vue";
export default {
  components: {
    userImg,
  },
  props: {
    wallet: {
      type: String,
      default: "",
      required: true,
    },
  },
  methods: {
    copyAddress: function () {
      const elem = document.createElement("textarea");
      elem.style.position = "absolute";
      elem.style.left = -99999999 + "px";
      elem.style.top = -99999999 + "px";
      elem.value = this.wallet;
      document.body.appendChild(elem);
      elem.select();
      document.execCommand("copy");
      document.body.removeChild(elem);
    },
  },
};
</script>
