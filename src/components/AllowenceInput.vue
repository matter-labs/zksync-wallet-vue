<template>
  <div class="amountInput" :class="{ error: error }">
    <i-input ref="amountInput" v-model="inputtedAmount" maxlength="35" size="lg" placeholder="Unlimited" type="text" @keyup.enter="$emit('enter')"></i-input>
    <div class="error">
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts">
import utils from "@/plugins/utils";
import { BigNumber } from "ethers";
import Vue from "vue";

export default Vue.extend({
  props: {
    value: {
      type: String,
      default: "",
      required: false,
    },
    token: {
      type: Object,
      required: false,
      default: undefined,
    },
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
    inputtedAmountBigNumber(): string | BigNumber {
      if (this.inputtedAmount) {
        try {
          return utils.parseToken(this.token.symbol, this.inputtedAmount);
        } catch (error) {
          return "0";
        }
      }
      return "0";
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
    error: {
      immediate: true,
      handler(val) {
        this.$emit("error", !!val);
      },
    },
  },
  mounted() {
    if (this.autofocus) {
      (this.$refs.amountInput as Vue)?.$el?.querySelector("input")?.focus();
    }
  },
  beforeDestroy() {
    this.$emit("error", false);
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
      if (val && !parseFloat(val as string)) {
        this.error = "Wrong amount inputted";
        return;
      }
      if (!val || !this.token) {
        this.error = "";
        return;
      }

      let inputAmount = null;
      try {
        inputAmount = utils.parseToken(this.token.symbol, val);
      } catch (error) {
        let errorInfo = `Amount processing error. Common reason behind it — inaccurate amount. Try again paying attention to the decimal amount number format — it should help`;
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
      this.error = "";
    },
  },
});
</script>
