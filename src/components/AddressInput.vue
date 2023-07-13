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
        maxlength="100"
        data-cy="address_block_wallet_address_input"
        placeholder="0x address or domain"
        spellcheck="false"
        type="text"
        @keyup.enter="$emit('enter')"
        @change="$emit('change', $event)"
        @input="getDomainAddress"
      />

      <transition name="fadeFast">
        <div v-if="rnsDomain" class="text-xs text-left flex domainAddress">
          <img height="16" width="16" src="/images/rootstock.png" alt="RNS Domain Logo" />
          {{ domainSubText }}
        </div>
        <div v-if="error" class="errorText" data-cy="address_block_error_message">{{ error }}</div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropOptions } from "vue";
import { Address, TokenSymbol } from "@rsksmart/rif-rollup-js-sdk/build/types";
import { validateAddress } from "@rsksmart/rif-rollup-nuxt-core/utils";

export default Vue.extend({
  props: {
    value: {
      type: String,
      default: "",
      required: false,
    } as PropOptions<Address>,
    token: {
      type: String,
      required: false,
      default: "RBTC",
    } as PropOptions<TokenSymbol>,
  },
  data() {
    return {
      inputtedWallet: this.value ?? "",
      domainFetchingInProgress: false,
      debounceTimer: null as NodeJS.Timeout | null,
    };
  },
  computed: {
    isValid(): boolean {
      return validateAddress(this.inputtedWallet) || this.isValidDomain;
    },
    error(): string {
      if (this.domainFetchingInProgress) {
        return "";
      }
      if (this.inputtedWallet && !this.isValid) {
        return "Invalid address";
      } else {
        return "";
      }
    },
    isValidDomain(): boolean {
      return !!this.getDomain && !this.domainFetchingInProgress;
    },
    getDomain(): string | null {
      return this.$store.getters["rns/getDomain"](this.inputtedWallet, this.token);
    },
    domainSubText(): string {
      const domain = this.rnsDomain;
      if (domain) {
        return domain.substring(0, 6) + "..." + domain.substring(domain.length - 6, domain.length);
      } else {
        return "";
      }
    },
    rnsDomain(): string | null {
      return this.getDomain;
    },
  },
  watch: {
    inputtedWallet(val) {
      const trimmed = val.trim().replace("zksync:", "");
      this.inputtedWallet = trimmed;
      if (val !== trimmed) {
        return;
      }
      this.$emit("input", this.isValid ? val : "");
    },
    getDomain(val) {
      val && this.$emit("input", val);
    },
    value(val) {
      if (this.isValid || (!this.isValid && !!val)) {
        this.inputtedWallet = val;
      }
    },
    token() {
      this.getDomainAddress();
    },
  },
  methods: {
    focusInput(): void {
      if (this.$refs.input) {
        (this.$refs.input as HTMLElement).focus();
      }
    },
    getDomainAddress() {
      if (this.debounceTimer) clearTimeout(this.debounceTimer);

      this.debounceTimer = setTimeout(async () => {
        if (!this.isValidDomain) {
          try {
            this.domainFetchingInProgress = true;
            await this.$store.dispatch("rns/lookupDomain", { address: this.inputtedWallet });
          } catch (error) {
            console.warn("RNS lookup failed", error);
          } finally {
            this.domainFetchingInProgress = false;
          }
        }
      }, 500); // Adjust the debounce delay as needed
    },
  },
});
</script>
