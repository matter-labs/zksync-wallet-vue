<template>
  <div class="transactionPage">
    <allowence-modal />

    <!-- Choose token -->
    <i-modal v-model="chooseTokenModal" size="md">
      <template slot="header">Choose token</template>
      <choose-token tokens-type="L1" @chosen="chooseToken($event)" />
    </i-modal>

    <!-- Loading block -->
    <loading-block v-if="loading === true" :headline="loading && transactionInfo.type === 'unlock' ? `Unlocking ${chosenToken.symbol}` : 'Deposit'">
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
      :continue-btn-text="transactionInfo.continueBtnText"
      :fee="transactionInfo.fee"
      :tx-link="transactionInfo.explorerLink"
      :headline="transactionInfo.type === 'unlock' ? `${chosenToken.symbol} unlocked` : 'Deposit'"
      type="deposit"
      @continue="successBlockContinue"
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

      <div v-if="displayTokenUnlock && !thresholdLoading">
        <div class="_padding-top-1 _display-flex _align-items-center inputLabel" @click="$accessor.openModal('Allowence')">
          <span>{{ chosenToken.symbol }} Allowence</span>
          <i class="ri-question-mark iconInfo" />
        </div>
        <allowence-input ref="allowenceInput" v-model="inputtedAllowence" :token="chosenToken" :min-amount="amountBigNumber.toString()" @error="allowenceError = $event" @enter="commitTransaction()" />
      </div>

      <div class="errorText _text-center _margin-top-1">
        {{ error }}
      </div>
      <p v-if="displayTokenUnlock && !thresholdLoading" class="_text-center">
        <span v-if="zeroAllowence">
          You should firstly unlock selected token in order to authorize deposits for
          <span class="tokenSymbol">{{ chosenToken.symbol }}</span>
        </span>
        <span v-else>
          You do not have enough allowence for
          <span class="tokenSymbol">{{ chosenToken.symbol }}</span>. <br class="desktopOnly">
          Set highier allowence to proceed to deposit.
        </span>
      </p>

      <i-button :disabled="buttonDisabled" block class="_margin-top-1" size="lg" variant="secondary" @click="commitTransaction()">
        <span v-if="thresholdLoading">
          Loading...
        </span>
        <span v-else-if="displayTokenUnlock">
          Unlock <span class="tokenSymbol">{{ chosenToken.symbol }}</span> and Deposit
        </span>
        <span v-else>Deposit</span>
      </i-button>
    </div>
  </div>
</template>

<script lang="ts">
import chooseToken from "@/blocks/ChooseToken.vue";
import amountInput from "@/components/AmountInput.vue";
import allowenceInput from "@/components/AllowenceInput.vue";
import AllowenceModal from "@/blocks/modals/Allowence.vue";

import loadingBlock from "@/components/LoadingBlock.vue";
import successBlock from "@/components/SuccessBlock.vue";
import { APP_ETH_BLOCK_EXPLORER } from "@/plugins/build";

import { Balance, ETHOperation, GweiBalance } from "@/plugins/types";
import utils from "@/plugins/utils";
import { deposit } from "@/plugins/walletActions/transaction";
import { walletData } from "@/plugins/walletData";
import { BigNumber, ethers, Contract } from "ethers";
import Vue from "vue";

let zksync = null as any;
let thresholdTimeout: ReturnType<typeof setTimeout>;
export default Vue.extend({
  components: {
    loadingBlock,
    successBlock,
    amountInput,
    allowenceInput,
    chooseToken,
    AllowenceModal,
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
        continueBtnText: "",
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
      inputtedAllowence: "",
      allowenceError: false,
      tokenAllowence: false as (false | BigNumber),
      chosenToken: false as Balance | false,
      thresholdLoading: false,
      error: "",
    };
  },
  computed: {
    maxAmount(): string {
      return !this.chosenToken ? "0" : zksync!.closestPackableTransactionAmount(this.chosenToken.rawBalance).toString();
    },
    buttonDisabled(): boolean {
      return !this.inputtedAmount || !this.chosenToken || this.allowenceError || this.thresholdLoading;
    },
    amountBigNumber(): BigNumber {
      if(!this.chosenToken || !this.inputtedAmount) {
        return BigNumber.from("0");
      }
      try {
        return utils.parseToken(this.chosenToken.symbol, this.inputtedAmount);
      } catch (error) {
        return BigNumber.from("0");
      }
    },
    zeroAllowence(): boolean {
      if(this.tokenAllowence && this.tokenAllowence.eq(BigNumber.from("0"))) {
        return true;
      }
      return false;
    },
    enoughAllowence(): boolean {
      if(!this.tokenAllowence || !this.chosenToken) {
        return true;
      }
      if(this.zeroAllowence) {
        return false;
      }
      return (this.tokenAllowence.gte(this.maxAmount) || this.tokenAllowence.gte(this.amountBigNumber));
    },
    displayTokenUnlock(): boolean {
      return this.chosenToken && !this.enoughAllowence;
    }
  },
  watch: {
    displayTokenUnlock(val) {
      clearTimeout(thresholdTimeout);
      if(val===true && !this.zeroAllowence) {
        this.thresholdLoading = true;
        thresholdTimeout = setTimeout(() => {
          if(!this.inputtedAllowence) {
            this.setAllowenceToCurrent();
          }
          this.thresholdLoading = false;
        }, 800);
      } else {
        this.thresholdLoading = false;
      }
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
      this.chosenToken = false;
      this.tokenAllowence = await this.getTokeAllowence(token);
      this.setAllowenceToCurrent();
      /* if (!token.unlocked) {
        token.unlocked = await this.checkTokenState(token);
      }
      if (!token.tokenPrice) {
        token.tokenPrice = await this.$accessor.tokens.getTokenPrice(token.symbol);
      } */
      this.chosenToken = token;
      this.loading = false;
      this.$nextTick(() => {
        if (this.inputtedAmount && this.$refs.amountInput) {
          // @ts-ignore: Unreachable code error
          this.$refs.amountInput?.emitValue(this.inputtedAmount);
          // @ts-ignore: Unreachable code error
          this.$refs.allowenceInput?.emitValue(this.inputtedAllowence);
        }
      });
    },
    async commitTransaction(): Promise<void> {
      if (!this.inputtedAmount) {
        // @ts-ignore: Unreachable code error
        this.$refs.amountInput?.emitValue(this.inputtedAmount);
        // @ts-ignore: Unreachable code error
        this.$refs.allowenceInput?.emitValue(this.inputtedAllowence);
      }
      if (this.buttonDisabled) {
        return;
      }
      this.error = "";
      this.loading = true;
      try {
        if (this.displayTokenUnlock) {
          await this.unlockToken();
        } else {
          await this.deposit();
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
      this.transactionInfo.type = "deposit";
      const transferTransaction = (await deposit((this.chosenToken as Balance).symbol, this.amountBigNumber.toString(), this.$accessor)) as ETHOperation;
      this.transactionInfo.amount.amount = this.amountBigNumber.toString();
      this.transactionInfo.amount.token = this.chosenToken as Balance;
      this.transactionInfo.fee.token = this.chosenToken as Balance;
      this.transactionInfo.hash = transferTransaction.ethTx.hash;
      this.transactionInfo.explorerLink = APP_ETH_BLOCK_EXPLORER + "/tx/" + transferTransaction.ethTx.hash;
      this.tip = "Waiting for the transaction to be mined...";
      const receipt: ethers.ContractReceipt = await transferTransaction.awaitEthereumTxCommit();
      this.transactionInfo.fee.amount = receipt.gasUsed.toString();
      this.transactionInfo.continueBtnFunction = false;
      this.transactionInfo.continueBtnText = "";
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
        this.transactionInfo.type = "unlock";
        const approveAmount = this.inputtedAllowence ? utils.parseToken((this.chosenToken as Balance).symbol, this.inputtedAllowence) : undefined;
        const approveDeposits = await wallet!.approveERC20TokenDeposits(this.chosenToken.address as string, approveAmount);
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
        this.transactionInfo.continueBtnText = "Proceed to deposit";
        /* const isTokenUnlocked = await this.checkTokenState(this.chosenToken);
        if (isTokenUnlocked) {
          this.transactionInfo.success = true;
        } */
        this.transactionInfo.success = true;
        this.chosenToken = { ...this.chosenToken, unlocked: true };
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
    async getTokeAllowence(token: Balance): Promise<BigNumber> {
      const zksync = await walletData.zkSync();
      if (token.symbol.toLowerCase() !== "eth") {
        const wallet = walletData.get().syncWallet;
        const tokenAddress = wallet!.provider.tokenSet.resolveTokenAddress(token.symbol);
        const erc20contract = new Contract(tokenAddress, zksync.utils.IERC20_INTERFACE, wallet!.ethSigner);
        const currentAllowance = (await erc20contract.allowance(
          wallet!.address(),
          wallet!.provider.contractAddress.mainContract
        ) as BigNumber);
        return currentAllowance;
      }
      return BigNumber.from(zksync.utils.ERC20_APPROVE_TRESHOLD);
    },
    async successBlockContinue() {
      this.transactionInfo.success = false;
      this.transactionInfo.hash = "";
      this.transactionInfo.explorerLink = "";
      if (this.transactionInfo.type === "unlock") {
        if (!this.error) {
          this.loading = true;
          try {
            await this.deposit();
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
        }
      }
    },
    setAllowenceToCurrent() {
      if(!this.chosenToken || this.chosenToken.symbol === "ETH" || !this.tokenAllowence || this.zeroAllowence) {
        this.inputtedAllowence = "";
      } else {
        try {
          this.inputtedAllowence = utils.handleFormatToken(this.chosenToken.symbol, this.tokenAllowence.toString());
        } catch (error) {
          this.inputtedAllowence = "";
        }
      }
    }
  },
});
</script>
