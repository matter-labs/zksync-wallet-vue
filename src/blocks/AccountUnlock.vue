<template>
  <div v-if="!loading && !transactionInfo.success" class="tileBlock">
    <i-modal v-model="chooseTokenModal" size="md">
      <template slot="header">Choose token</template>
      <choose-token onlyAllowed @choosed="chooseToken($event)" />
    </i-modal>
    <div class="tileHeadline h3">
      Unlock account
    </div>
    <p class="tileTextBg">To start using your account you need to register your public key once. This operation costs
      15000 gas on-chain. In the future, we will eliminate this step by verifying ETH signatures with zero-knowledge
      proofs. Please bear with us!</p>
    <div class="_padding-y-1">Amount / asset</div>
    <i-input size="lg" placeholder="Select token" disabled :value="inputVal">
      <i-button v-if="!choosedToken" slot="append" block link variant="secondary" @click="chooseTokenModal=true">
        Select token
      </i-button>
      <i-button v-else slot="append" class="selectedTokenBtn" block link variant="secondary"
                @click="chooseTokenModal=true">{{ choosedToken.symbol }}&nbsp;&nbsp;<i class="far fa-angle-down"></i>
      </i-button>
    </i-input>
    <div v-if="errorText" class="errorText _text-center _margin-top-1">
      {{ errorText }}
    </div>
    <div v-if="!enoughFeeToken" class="errorText _text-center _margin-top-1">
      Not enough <span class="tokenSymbol">{{ choosedToken.symbol }}</span> to pay the fee
    </div>
    <i-button class="_margin-top-1" block variant="secondary" size="lg" :disabled="!choosedToken || !enoughFeeToken || !totalFee || feesLoading" @click="unlock()"><i
        class="far fa-lock-open-alt"></i> Unlock
    </i-button>
    <div v-if="totalFee" class="_text-center _margin-top-1">
      Fee:
      <span v-if="feesLoading" class="secondaryText">Loading...</span>
      <span v-else>
        {{ totalFee  | formatToken(choosedToken.symbol) }} {{choosedToken.symbol}}
        <span class="secondaryText">{{ totalFee | formatUsdAmount(choosedToken.tokenPrice, choosedToken.symbol) }}</span>
      </span>
    </div>
  </div>
  <loading-block headline="Unlock account" v-else-if="loading">
    <a v-if="transactionInfo.hash" class="_display-block _text-center" target="_blank"
      :href="transactionInfo.explorerLink">
      Link to the transaction <i class="fas fa-external-link"/>
    </a>
    <p v-if="tip" class="_display-block _text-center">{{ tip }}</p>
  </loading-block>
  <success-block headline="Unlock account" :fee="transactionInfo.fee" :txLink="transactionInfo.explorerLink" v-else-if="transactionInfo.success===true">
    <p class="_text-center _margin-top-0">
      Your account has been successfully unlocked.
      <br>Transaction will be processed shortly. Use the transaction link to track the progress.
    </p>
  </success-block>
</template>

<script lang="ts">
import Vue from 'vue';
import { walletData } from "@/plugins/walletData";
import { APP_ZKSYNC_BLOCK_EXPLORER } from "@/plugins/build";
import { Balance, GweiBalance, Transaction } from "@/plugins/types";
import { BigNumber } from "ethers";

import chooseToken from '@/blocks/ChooseToken.vue';
import loadingBlock from '@/components/LoadingBlock.vue';
import successBlock from '@/components/SuccessBlock.vue';

export default Vue.extend({
  data() {
    return {
      /* Choose token */
      chooseTokenModal: false,

      /* Transaction success block */
      transactionInfo: {
        success: false,
        hash: '',
        explorerLink: '',
        fee: {
          amount: '' as GweiBalance,
          token: false as (false | Balance)
        },
      },

      /* Loading block */
      loading: false,
      tip: '',

      /* Main */
      choosedToken: false as (false | Balance),
      totalFee: undefined as (undefined | GweiBalance),
      feesLoading: false,
      errorText: "",
    };
  },
  computed: {
    inputVal: function (): string {
      if (!this.choosedToken) {
        return "";
      } else {
        return `${this.choosedToken.symbol} (Balance: ${this.choosedToken.balance})`;
      }
    },
    enoughFeeToken: function(): boolean {
      if(!this.choosedToken || !this.totalFee || this.feesLoading) {
        return true;
      }
      // @ts-ignore: Unreachable code error
      return BigNumber.from(this.choosedToken.rawBalance).gt(this.totalFee);
    },
  },
  components: {
    chooseToken,
    loadingBlock,
    successBlock
  },
  methods: {
    chooseToken: function(token: Balance) {
      this.choosedToken=token;
      this.chooseTokenModal=false;
      this.getUnlockPrice();
    },
    unlock: async function(): Promise<string> {
      if(this.totalFee === undefined || this.choosedToken === false) {
        return "";
      }
      this.errorText = "";
      this.loading = true;
      try {
        const syncWallet = walletData.get().syncWallet;
        await this.$store.dispatch("wallet/restoreProviderConnection");
        this.tip = "Confirm the transaction to unlock this account";

        if (syncWallet?.ethSignerType?.verificationMethod === "ERC-1271") {
          const isOnchainAuthSigningKeySet = await syncWallet!.isOnchainAuthSigningKeySet();
          if (!isOnchainAuthSigningKeySet) {
            const onchainAuthTransaction = await syncWallet!.onchainAuthSigningKey();
            await onchainAuthTransaction?.wait();
          }

          const isSigningKeySet = await syncWallet!.isSigningKeySet();
          if (!isSigningKeySet) {
            const changePubkey = await syncWallet?.setSigningKey({
              feeToken: this.choosedToken.symbol,
              nonce: "committed",
              onchainAuth: true,
            });
            console.log('changePubkey', changePubkey);
            this.$store.dispatch('transaction/watchTransaction', {transactionHash: changePubkey.txHash, tokenSymbol: this.choosedToken.symbol});
            this.setTransactionInfo(changePubkey);
            this.tip = "Waiting for the transaction to be mined...";
            await changePubkey?.awaitReceipt();
          }
        } else {
          const isSigningKeySet = await syncWallet!.isSigningKeySet();
          if (!isSigningKeySet) {
            const changePubkey = await syncWallet!.setSigningKey({
              feeToken: this.choosedToken.symbol,
            });
            console.log('changePubkey', changePubkey);
            this.$store.dispatch('transaction/watchTransaction', {transactionHash: changePubkey.txHash, tokenSymbol: this.choosedToken.symbol});
            this.setTransactionInfo(changePubkey);
            this.tip = "Waiting for the transaction to be mined...";
            await changePubkey.awaitReceipt();
          }
        }
        const isSigningKeySet = await syncWallet?.isSigningKeySet();
        this.$store.commit("wallet/setAccountLockedState", isSigningKeySet === false);

        const newAccountState = await syncWallet?.getAccountState();
        walletData.set({ accountState: newAccountState });

        this.transactionInfo.success=true;
      } catch (error) {
        if (!error.message && !error.message.includes("User denied")) {
          this.tip = error.message;
        }
        this.tip = "Unknown error";
      }
      this.loading = false;
      return "";
    },
    getUnlockPrice: async function (): Promise<void> {
      if (!this.choosedToken) {
        return;
      }
      this.feesLoading = true;
      const syncWallet = walletData.get().syncWallet;
      const syncProvider = walletData.get().syncProvider;
      try {
        await this.$store.dispatch("wallet/restoreProviderConnection");
        const foundFee = await syncProvider?.getTransactionFee(
          {
            ChangePubKey: {
              onchainPubkeyAuth: syncWallet?.ethSignerType?.verificationMethod === "ERC-1271",
            },
          },
          syncWallet?.address() || '',
          this.choosedToken.symbol,
        );
        this.totalFee = foundFee!.totalFee.toString();
      } catch (error) {
        await this.$store.dispatch("toaster/error", error.message ? error.message : "Error while receiving an unlock fee");
      }
      this.feesLoading = false;
    },
    setTransactionInfo: function(transaction: Transaction): void {
      this.transactionInfo.fee.token = this.choosedToken;
      this.transactionInfo.hash = transaction.txHash;
      this.transactionInfo.explorerLink = APP_ZKSYNC_BLOCK_EXPLORER+'/transactions/'+transaction.txHash;
      this.transactionInfo.fee.amount = transaction.txData.tx.fee;
    }
  },
});
</script>
