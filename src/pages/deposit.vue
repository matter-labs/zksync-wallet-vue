<template>
  <div class="transactionPage">
    <!-- Choose token -->
    <i-modal v-model="chooseTokenModal" size="md">
      <template slot="header">Choose token</template>
      <choose-token tokens-type="L1" @chosen="chooseToken($event)" />
    </i-modal>

    <!-- Loading block -->
    <loading-block v-if="loading === true" headline="Deposit">
      <a v-if="transactionInfo.hash" :href="transactionInfo.explorerLink" class="_display-block _text-center" target="_blank">
        Link to the transaction <i class="ri-external-link-line" />
      </a>
      <p v-if="tip" class="_display-block _text-center">{{ tip }}</p>
    </loading-block>

    <!-- Transaction success block -->
    <success-block
      v-else-if="transactionInfo.success === true"
      :amount="transactionInfo.amount"
      :continue-btn-function="transactionInfo.continueBtnFunction"
      :fee="transactionInfo.fee"
      :tx-link="transactionInfo.explorerLink"
      headline="Deposit"
      type="deposit"
      @continue="
        transactionInfo.success = false;
        transactionInfo.hash = '';
        transactionInfo.explorerLink = '';
      "
    >
      <p v-if="transactionInfo.type === 'deposit'" class="_text-center _margin-top-0">
        Your deposit transaction has been mined and will be processed after required number of confirmations.
        <br />Use the transaction link to track the progress.
      </p>
      <p v-else-if="transactionInfo.type === 'unlock'" class="_text-center _margin-top-0">
        <span class="tokenSymbol">{{ chosenToken.symbol }}</span> token has been successfully unlocked and now you can proceed to deposit <br />Use the transaction link to track
        the progress.
      </p>
    </success-block>

    <!-- Main Block -->
    <div v-else class="transactionTile tileBlock">
      <div class="tileHeadline withBtn h3">
        <nuxt-link :to="fromRoute && fromRoute.fullPath !== $route.fullPath ? fromRoute : '/account'" class="returnBtn">
          <i class="ri-arrow-left-line"></i>
        </nuxt-link>
        <div>Deposit</div>
      </div>

      <div class="_padding-top-1 inputLabel">Amount</div>
      <amount-input
        ref="amountInput"
        v-model="inputtedAmount"
        :max-amount="maxAmount"
        :token="chosenToken ? chosenToken : undefined"
        autofocus
        type="deposit"
        @chooseToken="chooseTokenModal = true"
        @enter="commitTransaction()"
      />

      <div class="errorText _text-center _margin-top-1">
        {{ error }}
      </div>
      <p v-if="chosenToken && !chosenToken.unlocked" class="_text-center">
        You should firstly unlock selected token in order to authorize deposits for
        <span class="tokenSymbol">{{ chosenToken.symbol }}</span>
      </p>

      <i-button :disabled="buttonDisabled" block class="_margin-top-1" size="lg" variant="secondary" @click="commitTransaction()">
        {{ buttonType }}
        <span v-if="buttonType === 'Unlock'" class="tokenSymbol">{{ chosenToken.symbol }}</span>
      </i-button>
    </div>
  </div>
</template>

<script lang="ts">
import chooseToken from "@/blocks/ChooseToken.vue";
import amountInput from "@/components/AmountInput.vue";

import loadingBlock from "@/components/LoadingBlock.vue";
import successBlock from "@/components/SuccessBlock.vue";
import { APP_ETH_BLOCK_EXPLORER } from "@/plugins/build";

import { Balance, ETHOperation, GweiBalance } from "@/plugins/types";
import utils from "@/plugins/utils";
import { deposit } from "@/plugins/walletActions/transaction";
import { walletData } from "@/plugins/walletData";
import { ethers } from "ethers";
import Vue from "vue";

let zksync = null as any;

export default Vue.extend({
  components: {
    loadingBlock,
    successBlock,
    amountInput,
    chooseToken,
  },
  props: {
    fromRoute: {
      type: Object,
      default: undefined,
      required: false,
    },
  },
  data() {
    return {
      /* Loading block */
      loading: false,
      tip: "",

      /* Choose token */
      chooseTokenModal: false,
      chooseFeeTokenModal: false,

      /* Transaction success block */
      transactionInfo: {
        success: false,
        continueBtnFunction: false,
        type: "",
        hash: "",
        explorerLink: "",
        amount: {
          amount: "" as GweiBalance,
          token: false as false | Balance,
        },
        fee: {
          amount: "" as GweiBalance,
          token: false as false | Balance,
        },
      },

      /* Main Block */
      inputtedAmount: "",
      chosenToken: false as Balance | false,
      error: "",
    };
  },
  computed: {
    maxAmount(): string {
      return !this.chosenToken ? "0" : zksync!.closestPackableTransactionAmount(this.chosenToken.rawBalance).toString();
    },
    buttonType(): string {
      return !this.chosenToken || (this.chosenToken as Balance).unlocked ? "Deposit" : "Unlock";
    },
    buttonDisabled(): boolean {
      return this.buttonType === "Unlock" ? false : !this.inputtedAmount || !this.chosenToken;
    },
  },
  async mounted() {
    try {
      this.loading = true;
      if (this.$route.query.token) {
        const balances = this.$accessor.wallet.getzkBalances;
        for (const item of balances) {
          if (item.symbol === this.$route.query.token) {
            await this.chooseToken(item);
            break;
          }
        }
      }
      zksync = await walletData.zkSync();
      this.loading = false;
    } catch (error) {
      console.log(error);
      this.loading = false;
    }
  },
  methods: {
    async chooseToken(token: Balance) {
      this.loading = true;
      this.chooseTokenModal = false;
      if (!token.unlocked) {
        token.unlocked = await this.checkTokenState(token);
      }
      if (token.tokenPrice) {
        token.tokenPrice = await this.$accessor.tokens.getTokenPrice(token.symbol);
      }
      this.chosenToken = token;
      this.loading = false;
      this.$nextTick(() => {
        if (this.inputtedAmount && this.$refs.amountInput) {
          // @ts-ignore: Unreachable code error
          this.$refs.amountInput.emitValue(this.inputtedAmount);
        }
      });
    },
    async commitTransaction(): Promise<void> {
      if (!this.inputtedAmount) {
        // @ts-ignore: Unreachable code error
        this.$refs.amountInput.emitValue(this.inputtedAmount);
      }
      if (this.buttonDisabled) {
        return;
      }
      this.error = "";
      this.loading = true;
      try {
        if (this.buttonType === "Deposit") {
          await this.deposit();
        } else if (this.buttonType === "Unlock") {
          await this.unlockToken();
        }
      } catch (error) {
        if (error.message) {
          if (error.message.includes("User denied")) {
            this.error = "";
          } else if (error.message.includes("Fee Amount is not packable")) {
            this.error = "Fee Amount is not packable";
          } else if (error.message.includes("Transaction Amount is not packable")) {
            this.error = "Transaction Amount is not packable";
          }
        } else if (error.message && String(error.message).length < 60) {
          this.error = error.message;
        } else {
          this.error = "Transaction error";
        }
      }
      this.tip = "";
      this.loading = false;
    },
    async deposit(): Promise<void> {
      this.tip = "Confirm the transaction to deposit";
      const txAmount = utils.parseToken((this.chosenToken as Balance).symbol, this.inputtedAmount);
      // @ts-ignore: Unreachable code error
      const transferTransaction = (await deposit((this.chosenToken as Balance).symbol, txAmount.toString(), this.$accessor)) as ETHOperation;
      this.transactionInfo.amount.amount = txAmount.toString();
      this.transactionInfo.amount.token = this.chosenToken as Balance;
      this.transactionInfo.fee.token = this.chosenToken as Balance;
      this.transactionInfo.hash = transferTransaction.ethTx.hash;
      this.transactionInfo.explorerLink = APP_ETH_BLOCK_EXPLORER + "/tx/" + transferTransaction.ethTx.hash;
      this.tip = "Waiting for the transaction to be mined...";
      const receipt: ethers.ContractReceipt = await transferTransaction.awaitEthereumTxCommit();
      this.transactionInfo.fee.amount = receipt.gasUsed.toString();
      this.transactionInfo.continueBtnFunction = false;
      this.transactionInfo.type = "deposit";
      this.transactionInfo.success = true;
    },
    async unlockToken(): Promise<void> {
      if (!this.chosenToken) {
        return;
      }
      this.loading = true;
      try {
        const wallet = walletData.get().syncWallet;
        this.tip = `Confirm the transaction in order to unlock ${this.chosenToken.symbol} token`;
        const approveDeposits = await wallet!.approveERC20TokenDeposits(this.chosenToken.address as string);
        const balances = this.$accessor.wallet.getzkBalances;
        let ETHToken;
        for (const token of balances) {
          if (token.symbol === "ETH") {
            ETHToken = token;
            break;
          }
        }
        this.transactionInfo.amount.amount = "0";
        this.transactionInfo.amount.token = ETHToken as Balance;
        this.transactionInfo.fee.token = ETHToken as Balance;
        this.tip = "Waiting for the transaction to be mined...";
        const receipt: ethers.ContractReceipt = await approveDeposits.wait();
        this.transactionInfo.hash = receipt.transactionHash;
        this.transactionInfo.explorerLink = APP_ETH_BLOCK_EXPLORER + "/tx/" + receipt.transactionHash;
        this.transactionInfo.fee.amount = receipt.gasUsed.toString();
        this.transactionInfo.continueBtnFunction = true;
        this.transactionInfo.type = "unlock";
        const isTokenUnlocked = await this.checkTokenState(this.chosenToken);
        if (isTokenUnlocked) {
          this.transactionInfo.success = true;
        }
        this.chosenToken = { ...this.chosenToken, unlocked: isTokenUnlocked };
      } catch (error) {
        if (error.message) {
          if (!error.message.includes("User denied")) {
            this.error = error.message;
          }
        }
      }
      this.tip = "";
      this.loading = false;
    },
    async checkTokenState(token: Balance): Promise<boolean> {
      if (token.symbol.toLowerCase() !== "eth") {
        const wallet = walletData.get().syncWallet;
        return await wallet!.isERC20DepositsApproved(token.address as string);
      }
      return true;
    },
  },
});
</script>
