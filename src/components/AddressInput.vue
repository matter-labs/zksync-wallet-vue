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
        <div v-if="unsDomain" class="text-xs text-left flex domainAddress">
          <img height="20" width="20" src="/images/UnsLogo.png" alt="Unstoppable Domains Logo" />
          {{ domainSubText }}
        </div>
        <div v-if="error" class="errorText" data-cy="address_block_error_message">{{ error }}</div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropOptions } from "vue";
import { Address, TokenSymbol } from "zksync/build/types";
import { validateAddress } from "@matterlabs/zksync-nuxt-core/utils";

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
      default: "ETH",
    } as PropOptions<TokenSymbol>,
  },
  data() {
    return {
      inputtedWallet: this.value ?? "",
      domainFetchingInProgress: false,
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
      return this.$store.getters["uns/getDomain"](this.inputtedWallet, this.token);
    },
    domainSubText(): string {
      const domain = this.unsDomain;
      if (domain) {
        return domain.substring(0, 6) + "..." + domain.substring(domain.length - 6, domain.length);
      } else {
        return "";
      }
    },
    unsDomain(): string | null {
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
    getDomain() {
      this.$emit("input", this.isValid ? this.inputtedWallet : "");
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
    async getDomainAddress() {
      if (!this.isValidDomain) {
        try {
          this.domainFetchingInProgress = true;
          await this.$store.dispatch("uns/lookupDomain", { address: this.inputtedWallet });
        } catch (error) {
          console.warn("UNS lookup failed", error);
        } finally {
          this.domainFetchingInProgress = false;
        }
      }
    },
  },
});
</script>
