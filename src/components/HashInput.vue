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
        placeholder="0x hash | CID"
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

import Vue, { PropOptions } from "vue";
import utils from "@/plugins/utils";

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
      return this.inputtedHash.length > 0 && this.error === "";
    },
    error(): string {
      try {
        if (this.inputtedHash.length) {
          utils.contendAddressToHex(this.inputtedHash);
        }
        return "";
      } catch (e) {
        return e?.message || "Unknown error";
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
