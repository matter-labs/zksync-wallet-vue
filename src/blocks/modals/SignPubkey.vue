<template>
  <i-modal :value="opened" class="prevent-close" size="md" @hide="close()">
    <template slot="header">Account Activation</template>
    <div>
      <p v-if="step === false">
        To start using your zkSync account you need to register your public key once. This operation costs 15000 gas on-chain. In zkSync 2.0, we will eliminate this step by
        verifying ETH signatures with zero-knowledge proofs. Please bear with us!
      </p>
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
      if (!this.$accessor.getPreviousRoute) {
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
        const syncWallet = walletData.get().syncWallet;
        const nonce = await syncWallet!.getNonce("committed");
        if (syncWallet?.ethSignerType?.verificationMethod === "ERC-1271") {
          const isOnchainAuthSigningKeySet = await syncWallet!.isOnchainAuthSigningKeySet();
          if (!isOnchainAuthSigningKeySet) {
            const onchainAuthTransaction = await syncWallet!.onchainAuthSigningKey();
            await onchainAuthTransaction?.wait();
          }
        }

        const newPubKeyHash = await syncWallet!.signer!.pubKeyHash();
        if (typeof walletData.get().accountState!.id !== "number") {
          const accountState = await syncWallet!.getAccountState();
          walletData.set({ accountState });
        }
        const changePubKeyMessage = utils.getChangePubkeyLegacyMessage(newPubKeyHash, nonce, walletData.get().accountState!.id!);
        this.step = "sign";
        const ethSignature = (await syncWallet!.getEthMessageSignature(changePubKeyMessage)).signature;
        this.step = "loading";
        const changePubkeyTx: CPKLocal = {
          accountId: walletData.get().accountState!.id!,
          account: syncWallet!.address(),
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
