<template>
  <div v-if="!loading" class="tileBlock">
    <div class="tileHeadline h3">
      Unlock account
    </div>
    <p class="tileTextBg">To start using your account you need to register your public key once. This operation costs
      15000 gas on-chain. In the future, we will eliminate this step by verifying ETH signatures with zero-knowledge
      proofs. Please bear with us!</p>
    <div class="_padding-y-1">Amount / asset</div>
    <i-input size="lg" placeholder="Select token" disabled :value="inputVal">
      <i-button v-if="!choosedToken" slot="append" block link variant="secondary" @click="$emit('selectToken')">Select
        token
      </i-button>
      <i-button v-else slot="append" class="selectedTokenBtn" block link variant="secondary"
                @click="$emit('selectToken')">{{ choosedToken.symbol }}&nbsp;&nbsp;<i class="far fa-angle-down"></i>
      </i-button>
    </i-input>
    <div v-if="errorText" class="errorText _text-center _margin-top-1">
      {{ errorText }}
    </div>
    <i-button class="_margin-top-1" block variant="secondary" size="lg" :disabled="!choosedToken" @click="unlock()"><i
        class="far fa-lock-open-alt"></i> Unlock
    </i-button>
    <div v-if="totalFee" class="_text-center _margin-top-1">
      Fee:
      <span>
        {{totalFee}} {{choosedToken.symbol}}
        <span class="totalPrice">~${{(totalFee * choosedToken.tokenPrice).toFixed(2)}}</span>
      </span>
    </div>
  </div>
  <div v-else class="tileBlock">
    <div class="tileHeadline h3">
      Unlock account
    </div>
    <p v-if="tip" class="_display-block _text-center _margin-top-1">{{ tip }}</p>
    <div class="nothingFound _padding-y-2">
      <i-loader size="md" :variant="$inkline.config.variant === 'light' ? 'dark' : 'light'"/>
    </div>
  </div>
</template>

<script>
import walletData from "@/plugins/walletData.js";
import handleFormatToken from "@/plugins/handleFormatToken.js";

export default {
  props: {
    choosedToken: {
      required: false,
      default: "",
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
      if (!this.choosedToken) {
        return "";
      } else {
        return `${this.choosedToken.symbol} (Balance: ${this.choosedToken.balance})`;
      }
    },
  },
  methods: {
    unlock: async function () {
      if (this.choosedToken.balance < 0.000015) {
        return (this.errorText = `Not enough ${this.choosedToken.symbol} to perform a transaction`);
      }
      this.errorText = "";
      this.loading = true;
      try {
        const syncWallet = walletData.get().syncWallet;
        const syncProvider = walletData.get().syncProvider;
        if (!syncProvider.transport.ws.isOpened) {
          await syncProvider.transport.ws.open();
        }
        this.tip = "Confirm the transaction to unlock this account";
        if (syncWallet.ethSignerType.verificationMethod === "ERC-1271") {
          const onchainAuthTransaction = await syncWallet.onchainAuthSigningKey();
          await onchainAuthTransaction.wait();
          const changePubkey = await syncWallet.setSigningKey({
            feeToken: this.choosedToken.symbol,
            /* fee: foundFee.totalFee, */
            nonce: "committed",
            onchainAuth: true,
          });
          this.tip = "Waiting for the transaction to be mined...";
          await changePubkey.awaitReceipt();
        } else {
          const changePubkey = await syncWallet.setSigningKey({
            feeToken: this.choosedToken.symbol,
            /* fee: foundFee.totalFee, */
          });
          console.log("changePubkey", changePubkey);
          this.tip = "Waiting for the transaction to be mined...";
          await changePubkey.awaitReceipt();
        }
        this.tip = "Processing...";
        await this.$store.dispatch("wallet/forceRefreshData");

        const isSigningKeySet = await syncWallet.isSigningKeySet();
        console.log("isSigningKeySet", isSigningKeySet);
        this.$store.commit("wallet/setAccountLockedState", isSigningKeySet===false);
        
        const newAccountState = await syncWallet.getAccountState();
        console.log("newAccountState", newAccountState);
        walletData.set({ accountState: newAccountState });

      } catch (error) {
        if (!error.message && !error.message.includes("User denied")) {
          this.tip = error.message;
        }
        console.log("Unlock error", error);
      }
      this.loading = false;
    },
    getUnlockPrice: async function() {
      if(!this.choosedToken){return}
      this.loading=true;
      const syncWallet = walletData.get().syncWallet;
      const syncProvider = walletData.get().syncProvider;
      try {
        if (!syncProvider.transport.ws.isOpened) {
          await syncProvider.transport.ws.open();
        }
        const isOnchainAuthSigningKeySet = await syncWallet.isOnchainAuthSigningKeySet();
        const foundFee = await syncProvider.getTransactionFee(
          {
            ChangePubKey: {
              onchainPubkeyAuth: isOnchainAuthSigningKeySet
            }
          },
          syncWallet.address(),
          this.choosedToken.symbol
        );
        this.totalFee = parseFloat(handleFormatToken(this.choosedToken.symbol, foundFee.totalFee));
      } catch (error) {
        console.log('Get unlock fee error', error);
      }
      this.loading=false;
    }
  },
  mounted() {
    this.getUnlockPrice();
  },
};
</script>
