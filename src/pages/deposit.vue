<template>
  <div class="transactionPage depositPage dappPageWrapper">
    <allowance-modal />

    <!-- Choose token -->
    <i-modal v-model="chooseTokenModal" size="md">
      <template slot="header">Choose token</template>
      <choose-token tokens-type="L1" @chosen="chooseToken($event)" />
    </i-modal>

    <!-- Loading block -->
    <loading-block v-if="loading === true" :headline="loading && transactionInfo.type === 'unlock' ? `Approving ${chosenToken.symbol}` : 'Deposit'">
      <a v-if="transactionInfo.hash" :href="transactionInfo.explorerLink" class="_display-block _text-center" target="_blank">
        Link to the transaction
        <v-icon name="ri-external-link-line" class="_margin-left-05" />
      </a>
      <p v-if="tip" class="_display-block _text-center">{{ tip }}</p>
    </loading-block>

    <!-- Transaction success block -->
    <success-block
      v-else-if="transactionInfo.success === true"
      :amount="transactionInfo.type === 'unlock' ? undefined : transactionInfo.amount"
      :continue-btn-function="transactionInfo.continueBtnFunction"
      :continue-btn-text="transactionInfo.continueBtnText"
      :fee="transactionInfo.fee"
      :tx-link="transactionInfo.explorerLink"
      :headline="transactionInfo.type === 'unlock' ? `${chosenToken.symbol} approved` : 'Deposit'"
      :no-btn="transactionInfo.type === 'unlock' && !unlimitedApproval"
      type="deposit"
      @continue="successBlockContinue"
    >
      <template v-if="['deposit', 'unlock'].includes(transactionInfo.type)" slot="default">
        <p class="_text-center _margin-top-0">
          <template v-if="transactionInfo.type === 'deposit'">
            Your deposit transaction has been mined and will be processed after required number of confirmations.<br />Use the transaction link to track the progress.
          </template>
          <template v-else>
            Token <span class="tokenSymbol">{{ chosenToken.symbol }}</span> was successfully approved <span v-if="!unlimitedApproval"> for the {{ inputtedAmount }}</span>
            <br />
            Now you can proceed to deposit.
          </template>
        </p>
      </template>
      <template v-if="transactionInfo.type === 'unlock' && !unlimitedApproval" slot="custom">
        <div class="border-line _margin-top-1"></div>
        <div class="infoBlockItem smaller _margin-top-1">
          <div class="headline">Amount to deposit:</div>
          <div class="amount">
            <span class="tokenSymbol">{{ chosenToken.symbol }}</span>
            {{ amountBigNumber | formatToken(chosenToken.symbol) }}
            <span class="secondaryText">
              <token-price :symbol="chosenToken.symbol" :amount="amountBigNumber.toString()" />
            </span>
          </div>
        </div>
        <div class="goBackContinueBtns _margin-top-1">
          <i-button size="lg" variant="secondary" circle @click="successBlockGoBack()">
            <v-icon name="ri-arrow-left-line" />
          </i-button>
          <i-button block size="lg" variant="secondary" @click="successBlockContinue()">Proceed to deposit</i-button>
        </div>
      </template>
    </success-block>

    <!-- Main Block -->
    <div v-else class="transactionTile tileBlock">
      <div class="tileHeadline withBtn h3">
        <nuxt-link class="_icon-wrapped -rounded -sm returnBtn _display-flex" :to="fromRoute && fromRoute.fullPath !== $route.fullPath ? fromRoute : '/account'">
          <v-icon name="ri-arrow-left-line" scale="1" />
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
        <div class="_padding-top-1 _display-flex _align-items-center inputLabel" @click="$accessor.openModal('Allowance')">
          <span>
            <span class="tokenSymbol">{{ chosenToken.symbol }}</span> Allowance
          </span>
          <div class="iconInfo">
            <v-icon name="ri-question-mark" />
          </div>
        </div>
        <div class="grid-cols-2">
          <i-button block size="md" variant="secondary" @click="unlockToken(true)">
            Approve unlimited <span class="tokenSymbol">{{ chosenToken.symbol }}</span>
          </i-button>
          <i-button v-if="inputtedAmount" key="approveAmount" block class="_margin-top-0" size="md" variant="secondary" @click="unlockToken(false)">
            Approve {{ amountBigNumber | formatToken(chosenToken.symbol) }} <span class="tokenSymbol">{{ chosenToken.symbol }}</span>
          </i-button>
          <i-button v-else key="noApproveAmount" block class="_margin-top-0" size="md" disabled>
            Introduce <span class="tokenSymbol">{{ chosenToken.symbol }}</span> amount
          </i-button>
        </div>
      </div>

      <p v-if="displayTokenUnlock && !thresholdLoading" class="_text-center _margin-top-05">
        <span v-if="zeroAllowance">
          You should firstly approve selected token in order to authorize deposits for
          <span class="tokenSymbol">{{ chosenToken.symbol }}</span>
        </span>
        <span v-else>
          You do not have enough allowance for
          <span class="tokenSymbol">{{ chosenToken.symbol }}</span>
          .<br class="desktopOnly" />
          Set higher allowance to proceed to deposit.
        </span>
      </p>

      <div v-if="error" class="errorText _text-center _margin-top-1">{{ error }}</div>

      <i-button
        :disabled="buttonDisabled"
        block
        class="_margin-top-1 _display-flex flex-row"
        size="lg"
        variant="secondary"
        :loading="thresholdLoading"
        @click="commitTransaction()"
      >
        <template #loading>
          <loader size="xs" variant="dark" class="_margin-right-1-2" />
          Loading
        </template>
        <v-icon name="bi-download" scale="1.35" />&nbsp;&nbsp;Deposit
      </i-button>
    </div>
  </div>
</template>

<script lang="ts">
import chooseToken from "@/blocks/ChooseToken.vue";
import AllowanceModal from "@/blocks/modals/Allowance.vue";

import { APP_ETH_BLOCK_EXPLORER } from "@/plugins/build";
import utils from "@/plugins/utils";
import { deposit } from "@/plugins/walletActions/transaction";
import { walletData } from "@/plugins/walletData";

import { DecimalBalance, ZkInBalance, ZkInTransactionInfo } from "@/types/lib";
import { BigNumber, Contract, ContractInterface } from "ethers";
import Vue from "vue";
import { closestPackableTransactionAmount } from "zksync";
import { ERC20_APPROVE_TRESHOLD, IERC20_INTERFACE } from "zksync/build/utils";

let thresholdTimeout: ReturnType<typeof setTimeout>;
export default Vue.extend({
  components: {
    chooseToken,
    AllowanceModal,
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
      transactionInfo: <ZkInTransactionInfo>{
        success: false,
        continueBtnFunction: false,
        continueBtnText: "",
        type: "",
        hash: "",
        explorerLink: "",
        amount: {
          amount: "",
          token: false,
        },
        fee: {
          amount: "",
          token: false,
        },
      },

      /* Main Block */
      inputtedAmount: <DecimalBalance>"",
      inputtedAllowance: <DecimalBalance>"",
      allowanceError: false,
      tokenAllowance: <false | BigNumber>false,
      chosenToken: <ZkInBalance | false>false,
      thresholdLoading: false,
      unlimitedApproval: false,
      error: "",
    };
  },
  computed: {
    maxAmount(): string {
      return !this.chosenToken ? "0" : closestPackableTransactionAmount(this.chosenToken.rawBalance).toString();
    },
    buttonDisabled(): boolean {
      return this.displayTokenUnlock || !this.inputtedAmount || !this.chosenToken || this.allowanceError || this.thresholdLoading || !this.isEnoughAllowance;
    },
    amountBigNumber(): BigNumber {
      if (!this.chosenToken || !this.inputtedAmount) {
        return BigNumber.from("0");
      }
      try {
        return utils.parseToken(this.chosenToken.symbol, this.inputtedAmount);
      } catch (error) {
        return BigNumber.from("0");
      }
    },
    zeroAllowance(): boolean {
      return this.tokenAllowance && this.tokenAllowance.eq(BigNumber.from("0"));
    },
    enoughAllowance(): boolean {
      if (!this.tokenAllowance || !this.chosenToken) {
        return true;
      }
      if (this.zeroAllowance) {
        return false;
      }
      return this.tokenAllowance.gte(this.maxAmount) || this.tokenAllowance.gte(this.amountBigNumber);
    },
    isEnoughAllowance(): boolean {
      if (!this.inputtedAllowance || !this.tokenAllowance || !this.chosenToken || this.enoughAllowance) {
        return true;
      }
      try {
        return (utils.parseToken(this.chosenToken.symbol, this.inputtedAllowance) as BigNumber).gte(this.amountBigNumber);
      } catch (error) {
        return false;
      }
    },
    displayTokenUnlock(): boolean {
      return this.chosenToken && !this.enoughAllowance;
    },
  },
  watch: {
    displayTokenUnlock(val) {
      clearTimeout(thresholdTimeout);
      if (val === true && !this.zeroAllowance) {
        this.thresholdLoading = true;
        thresholdTimeout = setTimeout(() => {
          if (!this.inputtedAllowance) {
            this.setAllowanceToCurrent();
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
      this.loading = false;
    } catch (error) {
      console.log(error);
      this.loading = false;
    }
  },
  methods: {
    async chooseToken(token: ZkInBalance) {
      try {
        this.$accessor.tokens.getTokenPrice(token.symbol);
      } catch (error) {
        console.log(`Error getting ${token.symbol} price`, error);
        this.$accessor.tokens.addRestrictedToken(token.symbol);
      }
      this.loading = true;
      this.chooseTokenModal = false;
      this.chosenToken = false;
      this.tokenAllowance = await this.getTokenAllowance(token);
      this.setAllowanceToCurrent();
      this.chosenToken = token;
      this.loading = false;
      this.$nextTick(() => {
        if (this.inputtedAmount && this.$refs.amountInput) {
          // @ts-ignore: Unreachable code error
          this.$refs.amountInput?.emitValue(this.inputtedAmount);
        }
      });
    },
    async commitTransaction(): Promise<void> {
      if (!this.inputtedAmount) {
        // @ts-ignore: Unreachable code error
        this.$refs.amountInput?.emitValue(this.inputtedAmount);
      }
      if (this.buttonDisabled) {
        return;
      }
      this.error = "";
      this.loading = true;
      try {
        await this.deposit();
      } catch (error) {
        const errorMsg = utils.filterError(error);
        if (typeof errorMsg === "string") {
          this.error = errorMsg;
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
      const transferTransaction = await deposit((this.chosenToken as ZkInBalance).symbol, this.amountBigNumber.toString(), this.$accessor);
      if (!transferTransaction) {
        return;
      }
      this.transactionInfo.amount = {
        amount: this.amountBigNumber.toString(),
        token: this.chosenToken,
      };
      this.transactionInfo.hash = transferTransaction.ethTx.hash;
      this.transactionInfo.explorerLink = APP_ETH_BLOCK_EXPLORER + "/tx/" + transferTransaction.ethTx.hash;
      this.tip = "Waiting for the transaction to be mined...";
      const receipt = await transferTransaction.awaitEthereumTxCommit();
      this.transactionInfo.fee = undefined;
      this.transactionInfo.continueBtnFunction = false;
      this.transactionInfo.continueBtnText = "";
      this.transactionInfo.success = true;
    },
    async unlockToken(unlimited = true): Promise<void> {
      if (!this.chosenToken) {
        return;
      }
      this.unlimitedApproval = unlimited;
      this.loading = true;
      try {
        const wallet = walletData.get().syncWallet;
        this.tip = `Confirm the transaction in order to approve ${this.chosenToken.symbol} token`;
        this.transactionInfo.type = "unlock";
        const approveDeposits = await wallet!.approveERC20TokenDeposits(this.chosenToken.address as string, unlimited ? undefined : this.amountBigNumber);
        const balances = this.$accessor.wallet.getzkBalances;
        let ETHToken: ZkInBalance | undefined;
        for (const token of balances) {
          if (token.symbol === "ETH") {
            ETHToken = token;
            break;
          }
        }
        if (!ETHToken) {
          ETHToken = {
            balance: "0",
            id: 19,
            rawBalance: BigNumber.from("0"),
            restricted: false,
            status: "Verified",
            symbol: "ETH",
            verifiedBalance: "0",
          };
        }
        this.tip = "Waiting for the transaction to be mined...";
        this.transactionInfo.hash = approveDeposits.hash;
        this.transactionInfo.explorerLink = APP_ETH_BLOCK_EXPLORER + "/tx/" + approveDeposits.hash;
        await approveDeposits.wait();
        this.transactionInfo.amount = {
          amount: "0",
          token: ETHToken,
        };
        this.transactionInfo.fee = undefined;
        this.tokenAllowance = await this.getTokenAllowance(this.chosenToken);
        this.transactionInfo.continueBtnFunction = true;
        if (!unlimited) {
          this.transactionInfo.continueBtnText = "Proceed to deposit";
        } else {
          this.transactionInfo.continueBtnText = "Ok";
        }
        this.transactionInfo.success = true;
        this.chosenToken = { ...this.chosenToken, unlocked: true };
      } catch (error) {
        const errorMsg = utils.filterError(error);
        if (typeof errorMsg === "string") {
          this.error = errorMsg;
        } else {
          this.error = "Approve token error";
        }
      }
      this.tip = "";
      this.loading = false;
    },
    async getTokenAllowance(token: ZkInBalance): Promise<BigNumber> {
      if (token.symbol.toLowerCase() !== "eth") {
        const wallet = walletData.get().syncWallet;
        const tokenAddress = wallet!.provider.tokenSet.resolveTokenAddress(token.symbol);
        const erc20contract = new Contract(tokenAddress, IERC20_INTERFACE as ContractInterface, wallet!.ethSigner);
        return await erc20contract.allowance(wallet!.address(), wallet!.provider.contractAddress.mainContract);
      }
      return BigNumber.from(ERC20_APPROVE_TRESHOLD);
    },
    async successBlockContinue() {
      this.transactionInfo.success = false;
      this.transactionInfo.hash = "";
      this.transactionInfo.explorerLink = "";
      if (this.transactionInfo.type === "unlock") {
        if (this.transactionInfo.continueBtnText === "Ok") {
          return;
        }
        if (!this.error) {
          this.loading = true;
          try {
            await this.deposit();
          } catch (error) {
            const errorMsg = utils.filterError(error);
            if (typeof errorMsg === "string") {
              this.error = errorMsg;
            } else {
              this.error = "Transaction error";
            }
          }
          this.tip = "";
          this.loading = false;
        }
      }
    },
    successBlockGoBack() {
      this.transactionInfo.success = false;
      this.transactionInfo.hash = "";
      this.transactionInfo.explorerLink = "";
    },
    setAllowanceToCurrent() {
      if (!this.chosenToken || this.chosenToken.symbol === "ETH" || !this.tokenAllowance || this.zeroAllowance) {
        this.inputtedAllowance = "";
      } else {
        try {
          this.inputtedAllowance = utils.handleFormatToken(this.chosenToken.symbol, this.tokenAllowance.toString());
        } catch (error) {
          this.inputtedAllowance = "";
        }
      }
    },
  },
});
</script>
