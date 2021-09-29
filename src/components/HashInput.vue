<template>
  <div class="addressInput">
    <div class="walletContainer inputWallet" :class="{ error: error }" @click.self="focusInput()">
      <i-button v-if="isCID" class="-open-in-new-window" size="sm" variant="secondary" circle @click="openInNewWindow">
        <v-icon name="ri-external-link-line" />
      </i-button>
      <i-button v-else class="-open-in-new-window" size="sm" variant="secondary" circle disabled>
        <v-icon name="ri-file-line" />
      </i-button>
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
import { IPFS_GATEWAY } from "@/plugins/build";
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
    isCID(): boolean {
      return utils.isCID(this.inputtedHash);
    },
    error(): string {
      try {
        if (this.inputtedHash.length) {
          utils.contendAddressToRawContentHash(this.inputtedHash);
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
    openInNewWindow(): void {
      if (!this.isCID) {
        return;
      }

      const url = `${IPFS_GATEWAY}/ipfs/${this.inputtedHash}`;
      window.open(url, "_blank");
    },
  },
});
</script>

<style lang="scss" scoped>
button.-open-in-new-window {
  width: 27px !important;
  height: 27px !important;
}
</style>
