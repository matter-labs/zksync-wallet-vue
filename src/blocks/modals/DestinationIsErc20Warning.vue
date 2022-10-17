<template>
  <i-modal v-model="opened" size="md">
    <template #header>Transaction warning</template>
    <div>
      <div class="_padding-bottom-1">
        Provided destination address is an address of <b>{{ tokenSymbol }}</b> token smart contract. If you proceed you
        will no longer be able to access the {{ isNFT ? "NFT" : "funds" }} you're sending! In case you want to
        {{ actionName }} to an actual account, please provide its address instead.
      </div>
      <i-checkbox v-model="transactionWarningCheckmark">Do not show this again</i-checkbox>
      <i-button block class="_margin-top-1" size="lg" variant="secondary" @click="proceed()">
        {{ actionName }} to <b>{{ tokenSymbol }}</b> smart contract
      </i-button>
    </div>
  </i-modal>
</template>

<script lang="ts">
import { ZkTransactionType } from "@matterlabs/zksync-nuxt-core/types";
import Vue, { PropOptions } from "vue";

import { Address, Tokens } from "zksync/build/types";

export const warningCanceledKey = "canceledDestinationIsERC20Warning";
export default Vue.extend({
  name: "DestinationIsERC20Warning",
  props: {
    address: {
      required: false,
      type: String,
      default: "",
    } as PropOptions<Address>,
  },
  data() {
    return {
      transactionWarningCheckmark: false,
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
        return this.$accessor.currentModal !== null && this.$accessor.currentModal === "DestinationIsERC20Warning";
      },
    },
    actionName(): string | undefined {
      return this.$store.getters["zk-transaction/transactionActionName"];
    },
    type(): ZkTransactionType {
      return this.$store.getters["zk-transaction/type"];
    },
    tokenSymbol(): string {
      const tokens: Tokens = this.$store.getters["zk-tokens/zkTokens"];
      if (!tokens || !this.address) {
        return "";
      }
      const tokensAddressToSymbol = Object.fromEntries(
        Object.entries(tokens).map(([symbol, token]) => [token.address.toLowerCase(), symbol])
      );
      return tokensAddressToSymbol[this.address?.toLowerCase()];
    },
    isNFT(): boolean {
      return this.type?.includes("NFT");
    },
  },
  methods: {
    proceed() {
      if (this.transactionWarningCheckmark) {
        localStorage.setItem(warningCanceledKey, "true");
      }
      this.$accessor.closeActiveModal(true);
    },
  },
});
</script>
