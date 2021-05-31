<template>
  <div class="addressInput">
    <div class="walletContainer inputWallet" :class="{ error: error }" @click.self="focusInput()">
      <lazy-user-img v-if="isValid" :wallet="inputtedWallet" />
      <div v-else class="userImgPlaceholder userImg"></div>
      <!--suppress HtmlFormInputWithoutLabel -->
      <input
        ref="input"
        v-model="inputtedWallet"
        autocomplete="none"
        class="walletAddress"
        maxlength="45"
        placeholder="0x address"
        spellcheck="false"
        type="text"
        @keyup.enter="$emit('enter')"
      />
      <transition name="fadeFast">
        <div v-if="error" class="errorText">{{ error }}</div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import { DecimalBalance } from "@/types/lib";

import utils from "@/plugins/utils";
import Vue, { PropOptions } from "vue";

export default Vue.extend({
  props: {
    value: {
      type: String,
      default: "",
      required: false,
    } as PropOptions<DecimalBalance>,
  },
  data() {
    return {
      inputtedWallet: this.value ?? "",
    };
  },
  computed: {
    isValid(): boolean {
      return utils.validateAddress(this.inputtedWallet);
    },
    error(): string {
      if (this.inputtedWallet && !this.isValid) {
        return "Invalid address";
      } else {
        return "";
      }
    },
  },
  watch: {
    inputtedWallet(val) {
      const trimmed = val.trim();
      this.inputtedWallet = trimmed;
      if (val !== trimmed) {
        return;
      }
      this.$emit("input", this.isValid ? val : "");
    },
    value(val) {
      if (this.isValid || (!this.isValid && !!val)) {
        this.inputtedWallet = val;
      }
    },
  },
  methods: {
    focusInput(): void {
      if (this.$refs.input) {
        (this.$refs.input as HTMLElement).focus();
      }
    },
  },
});
</script>
