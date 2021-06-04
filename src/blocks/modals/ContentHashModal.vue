<template>
  <i-modal v-model="opened" size="md">
    <template slot="header">What is a content hash?</template>
    <p>
      A content hash is a cryptographic hash of raw content. Different systems have different ways of turning this hash (called a digest) into an identifier that their system uses
      to locate content. The most popular decentralized data storage services are IPFS and Arweave.
      <br /><br />No experience with content hashes? Use <a href="https://agitated-kalam-387033.netlify.app/" target="_blank">this tool</a>! It will automagically upload your content to IPFS and mint it
      to your zkSync account.
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
