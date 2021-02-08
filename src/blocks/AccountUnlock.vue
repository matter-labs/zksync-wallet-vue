<template>
  <div v-if="!loading" class="tileBlock">
    <div class="tileHeadline h3">Unlock account</div>
    <p class="tileTextBg">
      To start using your account you need to register your public key once. This operation costs 15000 gas on-chain. In the future, we will eliminate this step by verifying ETH
      signatures with zero-knowledge proofs. Please bear with us!
    </p>
    <div class="_padding-y-1">Amount / asset</div>
    <i-input size="lg" placeholder="Select token" disabled :value="inputVal">
      <i-button v-if="!chosenToken" slot="append" block link variant="secondary" @click="$emit('selectToken')"> Select token </i-button>
      <i-button v-else slot="append" class="selectedTokenBtn" block link variant="secondary" @click="$emit('selectToken')"
        >{{ chosenToken.symbol }}&nbsp;&nbsp;<i class="far fa-angle-down"></i>
      </i-button>
    </i-input>
    <div v-if="errorText" class="errorText _text-center _margin-top-1">
      {{ errorText }}
    </div>
    <i-button class="_margin-top-1" block variant="secondary" size="lg" :disabled="!chosenToken" @click="unlock()"><i class="far fa-lock-open-alt"></i> Unlock </i-button>
    <div v-if="totalFee" class="_text-center _margin-top-1">
      Fee:
      <span>
        {{ totalFee }} {{ chosenToken.symbol }}
        <span class="totalPrice">{{ getFormattedPrice(totalFee, chosenToken.tokenPrice) }}</span>
      </span>
    </div>
  </div>
  <div v-else class="tileBlock">
    <div class="tileHeadline h3">Unlock account</div>
    <p v-if="tip" class="_display-block _text-center _margin-top-1">{{ tip }}</p>
    <div class="nothingFound _padding-y-2">
      <loader />
    </div>
  </div>
</template>

<script>
import { walletData } from "@/plugins/walletData";
import utils from "@/plugins/utils";

export default {
  props: {
    chosenToken: {
      type: Object,
      required: false,
      default: undefined,
    },
  },
  data() {
    return {
      loading: false,
      errorText: "",
      tip: "",
      totalFee: false,
    };
  },
  computed: {
    inputVal: function () {
      if (!this.chosenToken) {
        return "";
      } else {
        return `${this.chosenToken.symbol} (Balance: ${this.chosenToken.balance})`;
      }
    },
  },
  watch: {
    chosenToken(val) {
      this.getUnlockPrice();
    },
  },
  mounted() {
    this.getUnlockPrice();
  },
  methods: {
    async unlock() {
      if (this.chosenToken.balance < this.totalFee) {
        return (this.errorText = `Not enough ${this.chosenToken.symbol} to perform a transaction`);
      }
      this.errorText = "";
      this.loading = true;
      try {
        const syncWallet = walletData.get().syncWallet;
        await this.$store.dispatch("wallet/restoreProviderConnection");
        this.tip = "Confirm the transaction to unlock this account";

        if (syncWallet.ethSignerType.verificationMethod === "ERC-1271") {
          const isOnchainAuthSigningKeySet = await syncWallet.isOnchainAuthSigningKeySet();
          if (!isOnchainAuthSigningKeySet) {
            const onchainAuthTransaction = await syncWallet.onchainAuthSigningKey();
            await onchainAuthTransaction.wait();
          }

          const isSigningKeySet = await syncWallet.isSigningKeySet();
          if (!isSigningKeySet) {
            const changePubkey = await syncWallet.setSigningKey({
              feeToken: this.chosenToken.symbol,
              nonce: "committed",
              onchainAuth: true,
            });
            this.tip = "Waiting for the transaction to be mined...";
            await changePubkey.awaitReceipt();
          }
        } else {
          const isSigningKeySet = await syncWallet.isSigningKeySet();
          if (!isSigningKeySet) {
            const changePubkey = await syncWallet.setSigningKey({
              feeToken: this.chosenToken.symbol,
            });
            this.tip = "Waiting for the transaction to be mined...";
            await changePubkey.awaitReceipt();
          }
        }
        this.tip = "Processing...";
        await this.$store.dispatch("wallet/forceRefreshData");

        const isSigningKeySet = await syncWallet.isSigningKeySet();
        this.$store.commit("wallet/setAccountLockedState", isSigningKeySet === false);

        const newAccountState = await syncWallet.getAccountState();
        walletData.set({ accountState: newAccountState });
      } catch (error) {
        if (!error.message && !error.message.includes("User denied")) {
          this.tip = error.message;
        }
        this.tip = "Unknown error";
      }
      this.loading = false;
      return "";
    },
    getFormattedPrice: function (price, amount) {
      return utils.getFormatedTotalPrice(price, amount);
    },
    getUnlockPrice: async function () {
      if (!this.chosenToken) {
        return;
      }
      this.loading = true;
      const syncWallet = walletData.get().syncWallet;
      const syncProvider = walletData.get().syncProvider;
      try {
        await this.$store.dispatch("wallet/restoreProviderConnection");
        const foundFee = await syncProvider.getTransactionFee(
          {
            ChangePubKey: {
              onchainPubkeyAuth: syncWallet.ethSignerType.verificationMethod === "ERC-1271",
            },
          },
          syncWallet.address(),
          this.chosenToken.symbol,
        );
        this.totalFee = utils.handleFormatToken(this.chosenToken.symbol, foundFee.totalFee);
      } catch (error) {
        await this.$store.dispatch("toaster/error", error.message ? error.message : "Error while receiving an unlock fee");
      }
      this.loading = false;
    },
  },
};
</script>
