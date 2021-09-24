<template>
  <i-modal v-model="opened" size="md">
    <template slot="header">How to address content?</template>
    <p>
      To mint an NFT, you should import a file into an InterPlanetary File System. There are plenty of <a href="https://ipfs.io/#install" target="_blank">services</a> you can
      choose from that provide IPFS-protocol support. After the import, your file will get a unique Content Identifier (CID). With its help, anyone can retrieve its content on IPFS
      Network and assure your file remains decentralized, resilient and, persistently available.
    </p>
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
