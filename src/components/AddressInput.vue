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
        placeholder="0x address"
        spellcheck="false"
        type="text"
        @keyup.enter="$emit('enter')"
      />
    </div>
  </div>
</template>

<script lang="ts">
import userImg from "@/components/userImg.vue";
import { DecimalBalance } from "@/plugins/types";

import utils from "@/plugins/utils";
import Vue, { PropOptions } from "vue";

export default Vue.extend({
  components: {
    userImg,
  },
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
