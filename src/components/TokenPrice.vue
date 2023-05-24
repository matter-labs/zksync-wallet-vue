<template>
  <span class="tokenPrice">{{ amount | formattedPrice(symbol) }}</span>
</template>

<script lang="ts">
import Vue, { PropOptions } from "vue";

import { TokenSymbol } from "zksync/build/types";
import { BigNumberish } from "@ethersproject/bignumber";

export default Vue.extend({
  props: {
    symbol: {
      type: String,
      default: "",
      required: true,
    } as PropOptions<TokenSymbol>,
    amount: {
      type: String,
      default: "0",
      required: true,
    } as PropOptions<BigNumberish>,
  },
  mounted() {
    this.$store.dispatch("zk-tokens/getTokenPrice", this.symbol);
  },
});
</script>
