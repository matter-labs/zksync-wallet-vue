<template>
  <span class="tokenPrice">{{ price }}</span>
</template>

<script lang="ts">
import Vue, { PropOptions } from "vue";

import utils from "@/plugins/utils";
import { TokenSymbol } from "zksync/build/types";
import { GweiBalance } from "~/types/lib";

export default Vue.extend({
  name: "TokenPrice",
  props: {
    symbol: {
      type: String,
      default: "",
      required: true,
    } as PropOptions<TokenSymbol>,
    amount: {
      type: [String, Number],
      default: "0",
      required: true,
    } as PropOptions<GweiBalance | number>,
  },
  computed: {
    price(): string {
      if (this.$accessor.tokens.getTokenPrices[this.symbol]) {
        return utils.getFormattedTotalPrice(
          Number(this.$accessor.tokens.getTokenPrices[this.symbol].price),
          typeof this.amount === "string" ? +utils.handleFormatToken(this.symbol, this.amount) : this.amount,
        );
      } else {
        return "";
      }
    },
  },
});
</script>
