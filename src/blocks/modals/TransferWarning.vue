<template>
  <i-modal v-model="opened" size="md">
    <template #header>Transfer warning</template>
    <div>
      <div class="_padding-bottom-1">
        You are about to transfer {{ isNFT ? "NFT" : "money" }} to an address that doesn't have a zkSync Lite balance
        yet. The transfer will happen inside zkSync Lite L2. If you want to move {{ isNFT ? "NFT" : "money" }} from
        zkSync Lite to the mainnet, please use the
        <nuxt-link
          :to="isNFT ? '/transaction/nft/withdraw' : '/transaction/withdraw'"
          @click.native="$accessor.closeActiveModal()"
          >Withdraw{{ isNFT ? " NFT" : "" }}
        </nuxt-link>
        function instead.
      </div>
      <i-checkbox v-model="transferWithdrawWarningCheckmark">Do not show this again</i-checkbox>
      <i-button block class="_margin-top-1" size="lg" variant="secondary" @click="proceed()"
        >Transfer{{ isNFT ? " NFT" : "" }} inside zkSync Lite
      </i-button>
    </div>
  </i-modal>
</template>

<script lang="ts">
import Vue from "vue";

import { ZkTransactionType } from "@matterlabs/zksync-nuxt-core/types";

export const warningCanceledKey = "canceledTransferWithdrawWarning";
export default Vue.extend({
  name: "TransferWarning",
  data() {
    return {
      transferWithdrawWarningCheckmark: false,
    };
  },
  computed: {
    opened: {
      set(val: boolean): void {
        if (!val) {
          this.$accessor.closeActiveModal();
        }
      },
      get(): boolean {
        return this.$accessor.currentModal !== null && this.$accessor.currentModal === "TransferWarning";
      },
    },
    isNFT(): boolean {
      return this.type?.includes("NFT");
    },
    type(): ZkTransactionType {
      return this.$store.getters["zk-transaction/type"];
    },
  },
  methods: {
    proceed() {
      if (this.transferWithdrawWarningCheckmark) {
        localStorage.setItem(warningCanceledKey, "true");
      }
      this.$accessor.closeActiveModal(true);
    },
  },
});
</script>
