<template>
  <div class="addressInput">
    <div class="walletContainer inputWallet" :class="{ error: error }" @click.self="focusInput()">
      <user-img v-if="isValid" :wallet="inputtedWallet" />
      <div v-else class="userImgPlaceholder userImg"></div>
      <!--suppress HtmlFormInputWithoutLabel -->
      <input
        ref="input"
        v-model="inputtedWallet"
        autocomplete="none"
        class="walletAddress"
        maxlength="45"
        data-cy="address_block_wallet_address_input"
        placeholder="0x address"
        spellcheck="false"
        type="text"
        @keyup.enter="$emit('enter')"
      />
      <transition name="fadeFast">
        <div v-if="error" class="errorText" data-cy="address_block_error_message">{{ error }}</div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropOptions } from "vue";
import { Address } from "zksync/build/types";
import { validateAddress } from "matter-dapp-module/utils";

export default Vue.extend({
  props: {
    value: {
      type: String,
      default: "",
      required: false,
    } as PropOptions<Address>,
  },
  data() {
    return {
      inputtedWallet: this.value ?? "",
    };
  },
  computed: {
    isValid(): boolean {
      return validateAddress(this.inputtedWallet);
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
