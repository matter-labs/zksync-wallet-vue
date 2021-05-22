<template>
  <div class="amountInput allowance" :class="{ error: error }">
    <i-input ref="amountInput" v-model="inputtedAmount" maxlength="35" size="lg" placeholder="Unlimited" type="text" @keyup.enter="$emit('enter')"></i-input>
    <div class="error">
      {{ error }}
    </div>
    <div v-if="token" class="_display-flex _justify-content-space-between">
      <div></div>
      <div class="linkText minAmount" @click="chooseMinAmount()">
        <transition name="fadeFast">
          <span v-if="minAmount !== '0'">Min: {{ minAmount | formatToken(token.symbol) }}</span>
        </transition>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { DecimalBalance, GweiBalance, ZkInToken } from "@/types/lib";
import utils from "@/plugins/utils";
import Vue, { PropOptions } from "vue";

export default Vue.extend({
  props: {
    value: {
      type: String,
      default: "",
      required: false,
    } as PropOptions<DecimalBalance>,
    token: {
      type: Object,
      required: false,
      default: undefined,
    } as PropOptions<ZkInToken | undefined>,
    minAmount: {
      type: String,
      default: "",
      required: false,
    } as PropOptions<GweiBalance>,
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
    minAmount: {
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
      if (val && !parseFloat(val)) {
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

      if (this.minAmount) {
        if (inputAmount.lt(this.minAmount)) {
          this.error = "Inputted amount is lower than the minimum amount";
          return;
        }
      }

      this.error = "";
    },
    chooseMinAmount() {
      try {
        if (!this.token) {
          return;
        }
        this.inputtedAmount = utils.handleFormatToken(this.token.symbol, this.minAmount);
      } catch (error) {
        console.log("Error choose max amount", error);
      }
    },
  },
});
</script>
