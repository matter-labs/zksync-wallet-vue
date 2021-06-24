<template>
  <div class="inputContainer rounded" :class="[`size-${size}`, { disabled }, { error }, { focused }, { autoWidth }]" @click.self="focusInput()">
    <div class="inputBody" @click="focusInput()">
      <div v-if="$slots.icon" class="iconContainer">
        <slot name="icon" />
      </div>
      <input
        ref="input"
        v-model="valNow"
        :style="[autoWidth ? { width: `${width}px` } : {}]"
        :disabled="disabled"
        :type="type"
        :placeholder="placeholder"
        :maxlength="maxlength"
        @focus="
          focused = true;
          $emit('focus');
        "
        @blur="
          focused = false;
          $emit('blur');
        "
        @keyup.enter="$emit('enter')"
      />
      <span v-if="autoWidth" ref="sizeSpan" class="sizeSpan">{{ valNow }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: {
    value: {
      type: String,
      default: "",
      required: false,
    },
    placeholder: {
      type: String,
      default: "",
      required: false,
    },
    maxlength: {
      type: Number,
      default: 500,
      required: false,
    },
    type: {
      type: String,
      default: "text",
      required: false,
    },
    error: {
      type: Boolean,
      default: false,
      required: false,
    },
    size: {
      type: String,
      default: "md",
      required: false,
    },
    autoWidth: {
      type: Boolean,
      default: false,
      required: false,
    },
    disabled: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  data() {
    return {
      valNow: this.value ? this.value : "",
      focused: false,
      width: 0,
    };
  },
  watch: {
    focused(val) {
      this.$emit("focused", val);
    },
    value(val) {
      this.valNow = val;
    },
    valNow(val) {
      this.emitValue(val);
      this.$nextTick(() => {
        this.calcWidth();
      });
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.calcWidth();
    });
  },
  methods: {
    emitValue(val: string): void {
      this.$emit("input", val);
    },

    /* Misc */
    focusInput(): void {
      if (this.disabled) {
        return;
      }
      (this.$refs.input as HTMLElement).focus();
    },
    calcWidth(): void {
      if (!this.autoWidth) {
        return;
      }
      const sizeSpan = this.$refs.sizeSpan;
      if (!sizeSpan) {
        return;
      }
      const inputSize = (sizeSpan as HTMLElement).getBoundingClientRect().width;
      this.width = inputSize + 4;
    },
  },
});
</script>
