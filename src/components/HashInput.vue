<template>
  <div class="addressInput">
    <div class="walletContainer inputWallet" :class="{ error: error }" @click.self="focusInput()">
      <lazy-user-img v-if="isValid" :wallet="inputtedHash" />
      <div v-else class="userImgPlaceholder userImg"></div>
      <!--suppress HtmlFormInputWithoutLabel -->
      <input
        ref="input"
        v-model="inputtedHash"
        autocomplete="none"
        class="walletAddress"
        maxlength="80"
        placeholder="0x hash"
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

import { ethers } from "ethers";
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
      inputtedHash: this.value ?? "",
    };
  },
  computed: {
    isValid(): boolean {
      try {
        ethers.utils.hexlify(this.inputtedHash);
        const contentHashBytes = ethers.utils.arrayify(this.inputtedHash);
        if (contentHashBytes.length !== 32) {
          return false;
        }
        return true;
      } catch (err) {
        return false;
      }
    },
    error(): string {
      if (this.inputtedHash && !this.isValid) {
        try {
          const contentHashBytes = ethers.utils.arrayify(this.inputtedHash);
          if (contentHashBytes.length !== 32) {
            return "Content hash must be 32 bytes long";
          }
        } catch (error) {}
        return "Invalid hash";
      } else {
        return "";
      }
    },
  },
  watch: {
    inputtedHash(val) {
      const trimmed = val.trim();
      this.inputtedHash = trimmed;
      if (val !== trimmed) {
        return;
      }
      this.$emit("input", this.isValid ? val : "");
    },
    value(val) {
      if (this.isValid || (!this.isValid && !!val)) {
        this.inputtedHash = val;
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
