<template>
  <span class="tokenPrice">{{ price }}</span>
</template>

<script lang="ts">
import Vue, { PropOptions } from "vue";

import { GweiBalance } from "@/types/lib";
import utils from "@/plugins/utils";
import { TokenSymbol } from "zksync/build/types";

export default Vue.extend({
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
      this.$accessor.tokens.getTokenPriceTick; // Force update price
      if (this.$accessor.tokens.getTokenPrices[this.symbol]) {
        return utils.getFormattedTotalPrice(
          +this.$accessor.tokens.getTokenPrices[this.symbol].price,
          (typeof this.amount === "string" ? +utils.handleFormatToken(this.symbol, this.amount) : this.amount) as number,
        );
      } else {
        return "";
      }
    },
  },
});
</script>
