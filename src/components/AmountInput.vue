<template>
  <div class="amountInput" :class="{ error: error }">
    <i-input ref="amountInput" v-model="inputtedAmount" data-cy="amount_block_token_input" maxlength="35" size="lg" type="text" @keyup.enter="$emit('enter')">
      <i-button v-if="!token" slot="append" data-cy="amount_block_token_select_button" block link variant="secondary" @click="$emit('chooseToken')"> Select token</i-button>
      <i-button v-else slot="append" data-cy="amount_block_token_select_button" block class="selectedTokenBtn" link variant="secondary" @click="$emit('chooseToken')">
        <span class="tokenSymbol">{{ token }}</span>
        &nbsp;&nbsp;<v-icon name="ri-arrow-down-s-line" />
      </i-button>
    </i-input>
    <div class="error" data-cy="amount_block_token_error_message">
      {{ error }}
    </div>
    <div v-if="token && maxAmount" class="_display-flex _justify-content-space-between">
      <div class="secondaryText">
        <token-price :symbol="token" :amount="inputtedAmountBigNumber.toString()" />
      </div>
      <div class="linkText" data-cy="amount_block_token_max_amount" @click="chooseMaxAmount()">{{ amountInputMaxText }}: {{ maxAmount | parseBigNumberish(token) }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropOptions } from "vue";
import { BigNumber, BigNumberish } from "ethers";
import { TokenSymbol } from "zksync/build/types";
import { isTransactionAmountPackable } from "zksync/build/utils";
import { DecimalBalance, ZkTransactionType } from "@matterlabs/zksync-nuxt-core/types";

export default Vue.extend({
  props: {
    value: {
      type: String,
      default: "",
      required: false,
    } as PropOptions<DecimalBalance>,
    type: {
      type: String,
      default: "Transfer",
      required: false,
    } as PropOptions<ZkTransactionType>,
    typeName: {
      type: String,
      default: "Transfer",
      required: false,
    },
    maxAmount: {
      type: String,
      default: "",
      required: false,
    } as PropOptions<BigNumberish>,
    token: {
      type: String,
      required: false,
      default: undefined,
    } as PropOptions<TokenSymbol>,
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
          return this.$options.filters!.parseDecimal(this.inputtedAmount, this.token);
        } catch (error) {}
      }
      return BigNumber.from("0");
    },
    amountInputMaxText(): string {
      if (this.type === "Deposit" && this.token === "ETH") {
        return "ETH balance";
      } else {
        return "Max";
      }
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
      if (val?.includes(",")) {
        this.inputtedAmount = val.replace(",", ".");
        return;
      }
      this.emitValue(val);
    },
    value(val) {
      if (!this.error || (this.error && !!val)) {
        this.inputtedAmount = val;
      }
    },
  },
  mounted() {
    if (this.autofocus && !this.$accessor.currentModal) {
      (this.$refs.amountInput as Vue)?.$el?.querySelector("input")?.focus();
    }
    if (!this.token) {
      this.$store.dispatch("zk-transaction/fillEmptySymbol");
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
        inputAmount = this.$options.filters!.parseDecimal(val, this.token);
      } catch (error) {
        let errorInfo = "Amount processing error. Common reason behind it — inaccurate amount. Try again paying attention to the decimal amount number format — it should help";
        if (error.message && error.message.search("fractional component exceeds decimals") !== -1) {
          errorInfo = `Precision exceeded: ${this.token} doesn't support that many decimal digits`;
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
          this.error = `Not enough ${this.token} to ${this.typeName} requested amount`;
          return;
        }
      }

      if (this.type === "Transfer" && !isTransactionAmountPackable(inputAmount.toString())) {
        this.error = "Max supported precision for transfers exceeded";
        return;
      }
      this.error = "";
    },
    chooseMaxAmount() {
      try {
        this.inputtedAmount = this.$options.filters!.parseBigNumberish(this.maxAmount, this.token);
      } catch (error) {
        console.warn("Error choose max amount\n", error);
      }
    },
  },
});
</script>
