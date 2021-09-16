<template>
  <i-modal :value="opened" class="prevent-close" size="md" data-cy="account_activation_modal" @hide="close()">
    <template slot="header">Account Activation</template>
    <div class="_text-center">
      <p v-if="state === false">Sign a message once to activate your zkSync account.</p>
      <p v-else-if="state === 'processing'" class="_text-center">Processing...</p>
      <p v-else-if="state === 'waitingForUserConfirmation'" class="_text-center">Sign the message in your wallet to continue</p>
      <p v-else-if="state === 'updating'" class="_text-center">Loading account data...</p>
      <i-button :disabled="loading" class="_margin-top-2" block size="lg" variant="secondary" data-cy="account_activation_sign_button" @click="signActivation()">
        <div class="_display-flex _justify-content-center _align-items-center">
          <div>Sign account activation</div>
          <loader v-if="loading" class="_margin-left-1" size="xs" />
        </div>
      </i-button>
      <div v-if="error" class="errorText _text-center _margin-top-1">
        {{ error }}
      </div>
    </div>
  </i-modal>
</template>

<script lang="ts">
import Vue from "vue";
import { ZkSignCPKState } from "matter-dapp-ui/types";

export default Vue.extend({
  name: "SignPubkey",
  data() {
    return {
      loading: false,
    };
  },
  computed: {
    opened(): boolean {
      return this.$accessor.currentModal === "SignPubkey";
    },
    state(): ZkSignCPKState {
      return this.$store.getters["zk-wallet/cpkSignState"];
    },
    error(): string | undefined {
      return this.$store.getters["zk-wallet/cpkSignError"];
    },
  },
  methods: {
    close() {
      this.$accessor.closeActiveModal();
      if (this.$store.getters["zk-wallet/cpk"] !== false) {
        return;
      }
      const isForbiddenRoute = () => {
        const forbiddenRoutes = ["/transaction/transfer", "/transaction/withdraw", "/transaction/nft/transfer", "/transaction/nft/withdraw"];
        for (const route of forbiddenRoutes) {
          if (this.$accessor.getPreviousRoute?.path === route || this.$accessor.getPreviousRoute?.path === route + "/") {
            return true;
          }
        }
        return false;
      };
      if (!this.$accessor.getPreviousRoute || isForbiddenRoute()) {
        this.$router.push("/");
      } else {
        // @ts-ignore
        this.$router.push(this.$accessor.getPreviousRoute);
      }
    },
    async signActivation() {
      await this.$store.dispatch("zk-wallet/signCPK");
      if (this.$store.getters["zk-wallet/cpk"] !== false) {
        this.close();
      }
    },
  },
});
</script>
