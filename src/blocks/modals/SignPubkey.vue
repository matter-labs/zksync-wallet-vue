<template>
  <i-modal :value="opened" class="prevent-close" size="md" @hide="close()">
    <template slot="header">Account Activation</template>
    <div>
      <p v-if="step === false">Sign a message once to activate your zkSync account.</p>
      <p v-else-if="step === 'sign'" class="_text-center">Sign the message in your wallet to continue</p>
      <p v-else-if="step === 'loading'" class="_text-center">Loading account data...</p>
      <i-button :disabled="loading" class="_margin-top-2" block size="lg" variant="secondary" @click="signActivation()">
        <div class="_display-flex _justify-content-center _align-items-center">
          <div>Sign account activation</div>
          <loader v-if="loading" class="_margin-left-1" size="xs" />
        </div>
      </i-button>
      <div class="errorText _text-center _margin-top-1">
        {{ error }}
      </div>
    </div>
  </i-modal>
</template>

<script lang="ts">
import Vue from "vue";
import { walletData } from "@/plugins/walletData";
import { utils } from "zksync";
import { saveCPKTx } from "@/plugins/walletActions/cpk";
import { CPKLocal } from "@/types/lib";
import zkUtils from "@/plugins/utils";

export default Vue.extend({
  name: "SignPubkey",
  data() {
    return {
      error: "",
      success: false,
      loading: false,
      step: false as false | "sign" | "loading",
    };
  },
  computed: {
    opened(): boolean {
      return this.$accessor.currentModal === "SignPubkey";
    },
  },
  methods: {
    close() {
      this.$accessor.closeActiveModal();
      if (this.success) {
        return;
      }
      const isForbiddenRoute = () => {
        const forbiddenRoutes = ["/transfer", "/withdraw", "/nft/transfer", "/nft/withdraw"];
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
      try {
        this.error = "";
        this.loading = true;
        this.step = "loading";
        const syncWallet = walletData.get().syncWallet!;
        const nonce = await syncWallet.getNonce("committed");
        if (syncWallet.ethSignerType?.verificationMethod === "ERC-1271") {
          const isOnchainAuthSigningKeySet = await syncWallet.isOnchainAuthSigningKeySet();
          if (!isOnchainAuthSigningKeySet) {
            const onchainAuthTransaction = await syncWallet.onchainAuthSigningKey();
            await onchainAuthTransaction?.wait();
          }
        }

        const newPubKeyHash = await syncWallet.signer!.pubKeyHash();
        const accountID = await syncWallet.getAccountId();
        if (typeof accountID !== "number") {
          throw new TypeError("It is required to have a history of balances on the account to activate it.");
        }
        const changePubKeyMessage = utils.getChangePubkeyLegacyMessage(newPubKeyHash, nonce, accountID!);
        this.step = "sign";
        const ethSignature = (await syncWallet.getEthMessageSignature(changePubKeyMessage)).signature;
        this.step = "loading";
        const changePubkeyTx: CPKLocal = {
          accountId: accountID!,
          account: syncWallet.address(),
          newPkHash: newPubKeyHash,
          nonce,
          ethSignature,
          validFrom: 0,
          validUntil: utils.MAX_TIMESTAMP,
        };
        saveCPKTx(this.$accessor.account.address!, changePubkeyTx);
        this.success = true;
        this.close();
      } catch (error) {
        console.log("signActivation error", error);
        const errorMsg = zkUtils.filterError(error);
        if (typeof errorMsg === "string") {
          this.error = errorMsg;
        } else {
          this.error = "Signing error";
        }
      }
      this.loading = false;
      this.step = false;
    },
  },
});
</script>
