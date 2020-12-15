<template>
    <div class="amountInputContainer" :class="[{'focused':focused},{'hasValue':valNow},{'disabled':disabled},('status-'+status)]" @click="focusInput()">
        <div class="inputContainer">
            <div class="pre">
                <slot name="pre" />
            </div>
            <input
                v-model="valNow"
                class="amountInput"
                :placeholder="placeholder"
                type="number"
                :readonly="disabled || loading"
                @input="inputed"
                @focus="focused=true"
                @blur="focused=false"
                @keyup.enter="$emit('enter', $event)"
            >
            <div class="append">
                <i v-if="status==='default'" class="far fa-pen"></i>
                <i v-else-if="status==='disabled'" class="far fa-lock"></i>
                <i v-else-if="status==='error'" class="far fa-exclamation-circle"></i>
                <i v-else-if="status==='success'" class="far fa-check"></i>
                <i v-else-if="status==='loading'" class="fad fa-spinner-third"></i>
            </div>
        </div>
        <div class="hints">
            <div class="hintGroup">
                <div v-if="min" class="hint" :class="{'red': valNow<min}">
                    <i class="fal fa-exclamation-circle"></i>
                    <span>Minimum required: {{min}}</span>
                    <div v-if="max" class="separator"></div>
                </div>
                <div v-if="max" class="hint" :class="{'red': valNow>max}">
                    <i class="fal fa-exclamation-circle"></i>
                    <span>Max value: {{max}}</span>
                </div>
            </div>
            <slot name="hints" />
        </div>
    </div>
</template>

<script>
import validation from "@/plugins/helpers/validation.js";
export default {
  props: {
    placeholder: {
      type: String,
      default: "",
      required: false,
    },
    value: {
      type: Number,
      default: null,
      required: false,
    },
    min: {
      type: Number,
      default: 0,
      required: false,
    },
    max: {
      type: Number,
      default: null,
      required: false,
    },
    disabled: {
      type: Boolean,
      default: false,
      required: false,
    },
    loading: {
      type: Boolean,
      default: false,
      required: false,
    },
    success: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  data() {
    return {
      valNow: this.value,
      error: "",
      focused: false,
    };
  },
  computed: {
    status: function () {
      if (this.loading === true) {
        return "loading";
      } else if (this.disabled === true) {
        return "disabled";
      } else if (this.success === true) {
        return "success";
      } else if (this.error) {
        return "error";
      }
      return "default";
    },
  },
  watch: {
    value(val) {
      if (this.valNow !== val && !this.error) {
        this.valNow = parseFloat(val);
      }
    },
  },
  mounted() {
    this.inputed();
  },
  methods: {
    focusInput: function () {
      if (!this.disabled && !this.loading) {
        return;
      }
      this.$el.querySelector("input").focus();
    },
    inputed: function () {
      if (this.valNow === undefined) {
        return this.$emit("input", undefined);
      }
      let decimalVal = String(this.valNow).split(".");
      if (decimalVal[1] !== undefined && decimalVal[1].length > 16) {
        this.valNow = parseFloat(decimalVal[0] + "." + decimalVal[1].substr(0, 16));
      }
      if (this.max && this.valNow > this.max) {
        this.error = `Max value: ${this.max}`;
      } else if (this.min && this.valNow < this.min) {
        this.error = `Minimum required: ${this.min}`;
      } else {
        this.error = "";
      }
      this.$emit("input", parseFloat(this.valNow));
    },
  },
};
</script>
