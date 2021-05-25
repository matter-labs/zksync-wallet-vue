<template>
  <div class="amountInput" :class="{ error: error }">
    <i-input ref="amountInput" v-model="inputtedAmount" maxlength="35" size="lg" type="text" @keyup.enter="$emit('enter')">
      <i-button v-if="!token" slot="append" block link variant="secondary" @click="$emit('chooseToken')"> Select token</i-button>
      <i-button v-else slot="append" block class="selectedTokenBtn" link variant="secondary" @click="$emit('chooseToken')">
        <span class="tokenSymbol">{{ token.symbol }}</span>
        &nbsp;&nbsp;<v-icon name="ri-arrow-down-s-line" />
      </i-button>
    </i-input>
    <div class="error">
      {{ error }}
    </div>
    <div v-if="token" class="_display-flex _justify-content-space-between">
      <div class="secondaryText">
        <token-price :symbol="token.symbol" :amount="inputtedAmountBigNumber.toString()" />
      </div>
      <div class="linkText" @click="chooseMaxAmount()">Max: {{ maxAmount | formatToken(token.symbol) }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { DecimalBalance, GweiBalance, ZkInToken } from "@/types/lib";
import utils from "@/plugins/utils";
import { BigNumber } from "ethers";
import Vue, { PropOptions } from "vue";

export default Vue.extend({
  props: {
    value: {
      type: String,
      default: "",
      required: false,
    } as PropOptions<DecimalBalance>,
    type: {
      type: String,
      default: "",
      required: false,
    },
    maxAmount: {
      type: String,
      default: "",
      required: false,
    } as PropOptions<GweiBalance>,
    token: {
      type: Object,
      required: false,
      default: undefined,
    } as PropOptions<ZkInToken>,
    autofocus: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  data() {
    return {
      inputtedAmount: this.value ? this.value : "",
      error: "",
    };
  },
  computed: {
    inputtedAmountBigNumber(): BigNumber {
      if (this.inputtedAmount) {
        try {
          return utils.parseToken(this.token.symbol, this.inputtedAmount);
        } catch (error) {
          this.$sentry.captureException(error);
        }
      }
      return BigNumber.from("0");
    },
  },
  watch: {
    token: {
      deep: true,
      handler() {
        if (!this.inputtedAmount) {
          return;
        }
        this.emitValue(this.inputtedAmount);
      },
    },
    maxAmount: {
      deep: true,
      handler() {
        if (!this.inputtedAmount) {
          return;
        }
        this.emitValue(this.inputtedAmount);
      },
    },
    inputtedAmount(val) {
      this.emitValue(val);
    },
    value(val) {
      if (!this.error || (this.error && !!val)) {
        this.inputtedAmount = val;
      }
    },
  },
  mounted() {
    if (this.autofocus) {
      (this.$refs.amountInput as Vue)?.$el?.querySelector("input")?.focus();
    }
  },
  methods: {
    emitValue(val: string): void {
      const trimmed = val.trim();
      this.inputtedAmount = trimmed;
      if (val !== trimmed) {
        return;
      }
      this.validateAmount(val);
      if (!this.error) {
        this.$emit("input", val);
      } else {
        this.$emit("input", "");
      }
    },
    validateAmount(val: string): void {
      if (!val || !parseFloat(val)) {
        this.error = "Wrong amount inputted";
        return;
      }
      if (!this.token) {
        this.error = "";
        return;
      }

      let inputAmount = null;
      try {
        inputAmount = utils.parseToken(this.token.symbol, val);
      } catch (error) {
        let errorInfo = "Amount processing error. Common reason behind it — inaccurate amount. Try again paying attention to the decimal amount number format — it should help";
        if (error.message && error.message.search("fractional component exceeds decimals") !== -1) {
          errorInfo = `Precision exceeded: ${this.token.symbol} doesn't support that many decimal digits`;
        }
        this.error = errorInfo;
        return;
      }

      if (inputAmount.lte(0)) {
        this.error = "Wrong amount inputted";
        return;
      }

      if (this.maxAmount) {
        if (inputAmount.gt(this.maxAmount)) {
          this.error = `Not enough ${this.token.symbol} to ${this.type} requested amount`;
          return;
        }
      }

      if (this.type === "transfer" && !utils.isAmountPackable(inputAmount.toString())) {
        this.error = "Max supported precision for transfers exceeded";
        return;
      }
      this.error = "";
    },
    chooseMaxAmount() {
      try {
        this.inputtedAmount = utils.handleFormatToken(this.token.symbol, this.maxAmount);
      } catch (error) {
        console.log("Error choose max amount", error);
      }
    },
  },
});
</script>
