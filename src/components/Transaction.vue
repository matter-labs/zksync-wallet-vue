<template>
  <div class="transactionPage dappPageWrapper">
    <!-- <sign-pubkey-modal :from-route="fromRoute" /> -->

    <i-modal v-model="chooseTokenModal" size="md">
      <template slot="header">Choose token</template>
      <choose-token @chosen="chooseToken($event)" />
    </i-modal>

    <!-- Choose fee token -->
    <i-modal v-model="chooseFeeTokenModal" size="md">
      <template slot="header">Choose fee token</template>
      <choose-token :only-allowed="true" @chosen="chooseFeeToken($event)" />
    </i-modal>

    <!-- Transfer warning modal -->
    <i-modal v-model="transferWithdrawWarningModal" class="prevent-close" size="md">
      <template slot="header">Transfer warning</template>
      <div>
        <div class="_padding-bottom-1">
          You are about to transfer money to an address that doesn't have a zkSync balance yet. The transfer will happen inside zkSync L2. If you want to move money from zkSync to
          the mainnet, please use the
          <nuxt-link :to="`/withdraw?w=${inputtedAddress}`">Withdraw</nuxt-link>
          function instead.
        </div>
        <i-checkbox v-model="transferWithdrawWarningCheckmark">Do not show this again</i-checkbox>
        <i-button block class="_margin-top-1" size="lg" variant="secondary" @click="warningDialogProceedTransfer()">Transfer inside zkSync</i-button>
      </div>
    </i-modal>

    <!-- Loading block -->
    <loading-block v-if="loading === true" :headline="transactionTypeName">
      <a v-if="transactionInfo.hash" :href="transactionInfo.explorerLink" class="_display-block _text-center" target="_blank">
        Link to the transaction <i><v-icon name="ri-external-link-line" scale="0.8" /></i>
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
      :headline="transactionTypeName"
      :recipient="transactionInfo.recipient"
      :tx-link="transactionInfo.explorerLink"
      :type="type"
      @continue="successBlockContinue"
    >
      <p v-if="transactionInfo.type === 'ActivateAccount'" class="_text-center _margin-top-0">Your account has been successfully unlocked and now you can proceed to {{ type }}.</p>
      <p v-else class="_text-center _margin-top-0">Your {{ type }} will be processed shortly. Use the transaction link to track the progress.</p>
    </success-block>

    <!-- Main Block -->
    <div v-else class="transactionTile tileBlock">
      <div class="tileHeadline withBtn h3">
        <nuxt-link :to="fromRoute && fromRoute.fullPath !== $route.fullPath ? fromRoute : '/account'" class="returnBtn">
          <v-icon name="ri-arrow-left-line" scale="1" />
        </nuxt-link>
        <div>
          {{ transactionTypeName }}
        </div>
      </div>

      <div class="_padding-top-1 inputLabel">Address</div>
      <address-input ref="addressInput" v-model="inputtedAddress" @enter="commitTransaction" />
      <choose-contact v-model="chosenContact" class="_margin-top-05" :address.sync="inputtedAddress" :display-own-address="type === 'withdraw'" />

      <div class="_padding-top-1 inputLabel">Amount</div>
      <amount-input
        ref="amountInput"
        v-model="inputtedAmount"
        :max-amount="maxAmount"
        :token="chosenToken ? chosenToken : undefined"
        :type="type"
        autofocus
        @chooseToken="chooseTokenModal = true"
        @enter="commitTransaction"
      />

      <!-- <i-radio-group
        v-if="chosenToken && type === 'withdraw' && (!chosenFeeToken || chosenFeeToken.symbol === chosenToken.symbol) && (feesObj || feesLoading) && inputtedAddress"
        v-model="transactionMode"
        class="_margin-top-2"
      >
        <i-radio value="normal">
          Normal withdraw
          <span class="feeAmount">
            (
            <strong>Fee:</strong>
            <span v-if="feesObj && feesObj.normal && !feesLoading">
              {{ feesObj && feesObj.normal | formatToken(feeToken.symbol) }}
              <span class="tokenSymbol">
                {{ feeToken.symbol }}
              </span>
              <span class="totalPrice">
                <token-price :symbol="feeToken.symbol" :amount="feesObj.normal.toString()" />
              </span>
            </span>
            <span v-else class="totalPrice">Loading...</span>
            ).
          </span>
          <br class="desktopOnly" />
          Processing time: {{ (withdrawTime.normal + 5400) | formatSeconds }}
        </i-radio>
        <i-radio value="fast">
          Fast withdraw
          <span class="feeAmount">
            (
            <strong>Fee:</strong>
            <span v-if="feesObj && feesObj.fast && !feesLoading">
              {{ feesObj.fast | formatToken(feeToken.symbol) }}
              <span class="tokenSymbol">{{ feeToken.symbol }}</span>
              <span class="totalPrice">
                <token-price :symbol="feeToken.symbol" :amount="feesObj.fast.toString()" />
              </span>
            </span>
            <span v-else class="totalPrice">Loading...</span>
            ).
          </span>
          <br class="desktopOnly" />
          Processing time: {{ (withdrawTime.fast + 5400) | formatSeconds }}
        </i-radio>
      </i-radio-group>
      <div v-else-if="chosenToken && type === 'withdraw' && feesObj && inputtedAddress" class="secondaryText _text-center _margin-top-1">
        Only normal withdraw ({{ (withdrawTime.normal + 5400) | formatSeconds }}) is available when using different fee token
      </div> -->

      <div class="errorText _text-center _margin-top-1">
        {{ error }}
      </div>

      <i-button :disabled="buttonDisabled" block class="_margin-top-05" size="lg" variant="secondary" @click="commitTransaction">
        <template v-if="ownAccountUnlocked">
          <v-icon v-if="type === 'withdraw'" name="ri-hand-coin-fill" />
          <v-icon v-else-if="type === 'transfer'" class="planeIcon" name="ri-send-plane-fill" />
        </template>
        <span>
          <span>{{ transactionTypeName }}</span>
        </span>
      </i-button>

      <div v-if="!enoughFeeToken" class="errorText _text-center _margin-top-1">
        Not enough <span class="tokenSymbol">{{ feeToken.symbol }}</span> to pay the fee
      </div>
      <div v-if="cantFindFeeToken === true && feesObj && chosenToken && inputtedAddress" class="errorText _text-center _margin-top-1">
        <span class="tokenSymbol">{{ chosenToken.symbol }}</span> is not suitable for paying fees<br />
        No available tokens on your balance to pay the fee
      </div>
      <div v-else>
        <div v-if="(chosenFeeObj || feesLoading) && chosenToken && inputtedAddress" class="_text-center _margin-top-1">
          Fee:
          <span v-if="feesLoading" class="secondaryText">Loading...</span>
          <span v-else>
            {{ feesObj && feesObj[transactionMode] | formatToken(feeToken.symbol) }} <span class="tokenSymbol">{{ feeToken.symbol }}</span>
            <span class="secondaryText">
              <token-price :symbol="feeToken.symbol" :amount="feesObj[transactionMode].toString()" />
            </span>
          </span>
        </div>

        <div v-if="!ownAccountUnlocked && feeToken && (activateAccountFee || activateAccountFeeLoading)" class="_text-center _margin-top-1-2">
          Account Activation single-time fee:
          <span v-if="activateAccountFeeLoading" class="secondaryText">Loading...</span>
          <span v-else>
            {{ activateAccountFee | formatToken(feeToken.symbol) }} <span class="tokenSymbol">{{ feeToken.symbol }}</span>
            <span class="secondaryText">
              <token-price :symbol="feeToken.symbol" :amount="activateAccountFee.toString()" />
            </span>
          </span>
        </div>
        <div v-if="(((feesObj && feesObj[transactionMode]) || feesLoading) && chosenToken && inputtedAddress) || !ownAccountUnlocked" class="_text-center _margin-top-1-2">
          <span class="linkText" @click="chooseFeeTokenModal = true">Change fee token</span>
        </div>
      </div>

      <div v-if="showTimeEstimationHint" class="totalPrice">Estimated processing time: <strong>~5 hours</strong></div>
    </div>
  </div>
</template>

<script lang="ts">
import chooseContact from "@/blocks/ChooseContact.vue";
import chooseToken from "@/blocks/ChooseToken.vue";
import addressInput from "@/components/AddressInput.vue";
import amountInput from "@/components/AmountInput.vue";

import loadingBlock from "@/components/LoadingBlock.vue";
import successBlock from "@/components/SuccessBlock.vue";
import { APP_ZKSYNC_BLOCK_EXPLORER, ETHER_NETWORK_NAME } from "@/plugins/build";

import { GweiBalance, ZkInBalance, ZkInContact, ZkInFeesObj, ZkInTransactionInfo, ZKTypeTransactionType } from "@/types/lib";
import utils from "@/plugins/utils";
import { transaction, withdraw } from "@/plugins/walletActions/transaction";
import { getCPKTx, removeCPKTx } from "@/plugins/walletActions/cpk";
import { walletData } from "@/plugins/walletData";

import { BigNumber, BigNumberish } from "ethers";
import Vue, { PropOptions } from "vue";
import { closestPackableTransactionAmount } from "zksync";
import { Address } from "zksync/build/types";
import { Transaction } from "zksync/build/wallet";

export default Vue.extend({
  components: {
    loadingBlock,
    successBlock,
    addressInput,
    chooseContact,
    amountInput,
    chooseToken,
  },
  props: {
    type: {
      type: String,
      default: "transfer",
      required: true,
    } as PropOptions<ZKTypeTransactionType>,
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
        hash: "",
        type: "",
        explorerLink: "",
        recipient: {
          address: "",
          name: "",
        },
        amount: {
          amount: "",
          token: false,
        },
        fee: {
          amount: "",
          token: false,
        },
      },

      /* Warning Modal */
      transferWithdrawWarningModal: false,

      /* Main Block */
      inputtedAddress: "",
      chosenContact: <ZkInContact | false>false,
      inputtedAmount: "",
      chosenToken: <ZkInBalance | false>false,
      chosenFeeToken: <ZkInBalance | false>false,
      feesObj: <ZkInFeesObj>{
        normal: "",
        fast: "",
      },
      feesLoading: false,
      transactionMode: <"normal" | "fast">"normal",
      cantFindFeeToken: false,
      withdrawTime: {
        normal: 0,
        fast: 0,
      },
      transferWithdrawWarningCheckmark: false,
      activateAccountFeeLoading: false,
      activateAccountFee: <GweiBalance | undefined>undefined,
      error: "",
    };
  },
  computed: {
    showTimeEstimationHint(): boolean {
      return ETHER_NETWORK_NAME === "mainnet" && this.chosenToken !== false && this.inputtedAddress !== "" && this.type === "withdraw";
    },
    chosenFeeObj(): BigNumberish | boolean {
      if (this.feesObj && this.transactionMode && !this.feesLoading) {
        const selectedFeeTypeAmount = this.transactionMode === "fast" ? this.feesObj.fast : this.feesObj.normal;
        if (!selectedFeeTypeAmount) {
          return BigNumber.from("0");
        }
        return BigNumber.from(selectedFeeTypeAmount);
      }
      return false;
    },
    transactionTypeName(): string {
      return this.type === "withdraw" ? "Withdraw" : this.type === "transfer" ? "Transfer" : "";
    },
    maxAmount(): GweiBalance {
      if (!this.chosenToken) {
        return "0";
      }

      let amount;
      if (
        (!this.chosenFeeToken || this.chosenToken.symbol === this.chosenFeeToken.symbol) &&
        !this.feesLoading &&
        (this.transactionMode === "normal" ? this.feesObj?.normal : this.feesObj?.fast)
      ) {
        amount = this.chosenToken.rawBalance.sub(this.chosenFeeObj as GweiBalance);
      } else {
        amount = this.chosenToken.rawBalance;
      }
      if (!this.ownAccountUnlocked && !this.activateAccountFeeLoading && this.activateAccountFee) {
        amount = amount.sub(this.activateAccountFee);
      }
      if (amount.lt("0")) {
        return "0";
      }
      return closestPackableTransactionAmount(amount).toString();
    },
    feeToken(): ZkInBalance {
      return this.chosenFeeToken ? this.chosenFeeToken : (this.chosenToken as ZkInBalance);
    },
    enoughFeeToken(): boolean {
      if (!this.ownAccountUnlocked && !this.activateAccountFeeLoading && this.activateAccountFee) {
        const feeAmount = BigNumber.from(this.activateAccountFee);
        return BigNumber.from(this.feeToken.rawBalance).gt(feeAmount);
      }
      if (
        this.cantFindFeeToken ||
        !this.inputtedAddress ||
        !this.chosenToken ||
        !this.feesObj ||
        !this.chosenFeeToken ||
        this.feesLoading ||
        this.chosenFeeToken.symbol === this.chosenToken.symbol
      ) {
        return true;
      }
      let feeAmount = BigNumber.from(this.feesObj[this.transactionMode]);
      if (!this.ownAccountUnlocked && !this.activateAccountFeeLoading && this.activateAccountFee) {
        feeAmount = feeAmount.add(this.activateAccountFee);
      }
      return BigNumber.from(this.chosenFeeToken.rawBalance).gt(feeAmount);
    },
    buttonDisabled(): boolean {
      if (!this.ownAccountUnlocked && !(this.feeToken && this.activateAccountFee && !this.activateAccountFeeLoading && this.enoughFeeToken)) {
        return true;
      }
      return !this.inputtedAddress || !this.inputtedAmount || !this.chosenToken || this.feesLoading || this.cantFindFeeToken || !this.enoughFeeToken;
    },
    ownAccountUnlocked(): boolean {
      return !this.$accessor.wallet.isAccountLocked;
    },
  },
  watch: {
    chosenContact: {
      deep: true,
      handler(val) {
        if (val && val.address) {
          this.inputtedAddress = val.address;
        } else {
          this.inputtedAddress = "";
        }
      },
    },
    inputtedAddress() {
      this.requestFees();
    },
  },
  async mounted() {
    try {
      this.loading = true;
      if (this.$route.query.w) {
        this.inputtedAddress = this.$route.query.w.toString();
      }
      if (this.$route.query.token) {
        const balances = this.$accessor.wallet.getzkBalances;
        for (const item of balances) {
          if (item.symbol === this.$route.query.token) {
            this.chooseToken(item);
            break;
          }
        }
      }
      if (this.type === "withdraw") {
        // await this?.getWithdrawalTime();
      }
      if (!this.ownAccountUnlocked) {
        try {
          getCPKTx(this.$accessor.account.address!); /* will throw an error if no cpk tx found */
        } catch (error) {
          const accountID = await walletData.get().syncWallet!.getAccountId();
          if (typeof accountID !== "number") {
            await this.$router.push("/account");
            return;
          } else {
            this.$accessor.openModal("SignPubkey");
          }
        }
        await this?.getAccountActivationFee();
      }
    } catch (error) {
      this?.$sentry.captureException(error);
    }
    this.loading = false;
  },
  methods: {
    chooseToken(token: ZkInBalance) {
      this.chosenToken = token;
      this.chooseTokenModal = false;
      this.transactionMode = "normal";
      const balances = <Array<ZkInBalance>>(
        JSON.parse(JSON.stringify(this.$accessor.wallet.getzkBalances)).sort((a: ZkInBalance, b: ZkInBalance) => parseFloat(b.balance as string) - parseFloat(a.balance as string))
      );
      if (this.chosenToken.restricted) {
        let tokenFound = false;
        for (const feeToken of balances) {
          if (!feeToken.restricted) {
            this.cantFindFeeToken = false;
            this.chosenFeeToken = feeToken;
            tokenFound = true;
            break;
          }
        }
        if (!tokenFound) {
          this.cantFindFeeToken = true;
        }
      } else {
        this.cantFindFeeToken = false;
      }
      this.requestFees();
      this.getAccountActivationFee();
    },
    chooseFeeToken(token: ZkInBalance) {
      this.chosenFeeToken = token;
      this.chooseFeeTokenModal = false;
      this.requestFees();
      this.getAccountActivationFee();
    },
    async requestFees(): Promise<void> {
      if (!this.chosenToken || !this.inputtedAddress || this.feeToken?.restricted) {
        this.feesObj = {
          normal: undefined,
          fast: undefined,
        };
        return;
      }
      this.feesLoading = true;
      try {
        const savedData = {
          address: this.inputtedAddress,
          symbol: this.chosenToken?.symbol,
          feeSymbol: this.feeToken?.symbol,
          type: this.type,
        };
        const requestedFee = await this.$accessor.wallet.requestFees(savedData);
        if (savedData.address === this.inputtedAddress && savedData.symbol === this.chosenToken?.symbol && savedData.feeSymbol === this.feeToken?.symbol) {
          this.feesObj = requestedFee;
        }
      } catch (error) {
        this.$toast.global.zkException({
          message: error.message,
        });
      }
      this.feesLoading = false;
    },
    async getWithdrawalTime(): Promise<void> {
      this.withdrawTime = await this.$accessor.wallet.requestWithdrawalProcessingTime();
    },
    async commitTransaction(): Promise<void> {
      if (!this.inputtedAmount) {
        // @ts-ignore: Unreachable code error
        (this.$refs.amountInput as Vue).emitValue(this.inputtedAmount);
      }
      if (this.buttonDisabled) {
        return;
      }
      this.error = "";
      this.loading = true;
      try {
        if (this.type === "withdraw") {
          await this.withdraw();
        } else if (this.type === "transfer") {
          await this.transfer();
        }
      } catch (error) {
        console.log("commitTransaction error", error);
        const errorMsg = utils.filterError(error);
        if (typeof errorMsg === "string") {
          this.error = errorMsg;
        } else {
          this.error = "Transaction error";
        }
        this.clearTransactionInfo();
      }
      this.tip = "";
      this.loading = false;
    },
    async withdraw(): Promise<void> {
      const txAmount: BigNumber = utils.parseToken((this.chosenToken as ZkInBalance).symbol, this.inputtedAmount);
      this.tip = "Confirm the transaction to withdraw";
      if (this.feesObj === undefined) {
        throw new Error("Fee fetching error");
      }
      const withdrawTransactions = await withdraw({
        address: this.inputtedAddress,
        token: (this.chosenToken as ZkInBalance).symbol,
        feeToken: this.feeToken.symbol,
        amount: txAmount.toString(),
        fastWithdraw: this.transactionMode === "fast",
        fee: (this.transactionMode === "fast" ? this.feesObj?.fast : this.feesObj?.normal) as string,
        store: this.$accessor,
        accountActivationFee: this.activateAccountFee,
      });

      this.transactionInfo.amount!.amount = txAmount.toString();
      this.transactionInfo.amount!.token = this.chosenToken as ZkInBalance;
      this.transactionInfo.fee!.token = this.feeToken;

      if (withdrawTransactions.cpkTransaction) {
        removeCPKTx(this.$accessor.account.address!);
        this.$accessor.wallet.setAccountLockedState(false);
        withdrawTransactions.cpkTransaction.awaitReceipt().then(async () => {
          const newAccountState = await walletData.get().syncWallet!.getAccountState();
          walletData.set({ accountState: newAccountState });
          this.$accessor.wallet.checkLockedState();
        });
      }

      this.transactionInfo.hash = withdrawTransactions.transaction!.txHash;
      this.transactionInfo.explorerLink = APP_ZKSYNC_BLOCK_EXPLORER + "/transactions/" + withdrawTransactions.transaction!.txHash;
      this.transactionInfo.fee!.amount = withdrawTransactions.feeTransaction!.txData.tx.fee;
      this.transactionInfo.recipient = {
        address: withdrawTransactions.transaction!.txData.tx.to,
        name: this.chosenContact ? this.chosenContact.name : "",
      };
      this.tip = "Waiting for the transaction to be mined...";
      const receipt = await withdrawTransactions.transaction?.awaitReceipt();
      this.transactionInfo.success = !!receipt!.success;
      if (receipt!.failReason) {
        throw new Error(receipt!.failReason);
      }
    },
    async transfer(): Promise<void> {
      const transferWithdrawWarning = localStorage.getItem("canceledTransferWithdrawWarning");
      this.tip = "Processing...";
      if (!transferWithdrawWarning && !this.transferWithdrawWarningModal) {
        const accountUnlocked = await this.accountUnlocked(this.inputtedAddress);
        if (!accountUnlocked) {
          this.transferWithdrawWarningModal = true;
          this.loading = false;
          return;
        }
      }
      this.tip = "Confirm the transaction to transfer";

      const calculatedFee = this.chosenFeeObj;

      if (calculatedFee === undefined) {
        throw new Error("Fee calculation failed");
      }

      const txAmount = utils.parseToken((this.chosenToken as ZkInBalance).symbol, this.inputtedAmount);
      const transferTransactions = await transaction(
        this.inputtedAddress,
        (this.chosenToken as ZkInBalance).symbol,
        this.feeToken.symbol,
        txAmount.toString(),
        calculatedFee as string,
        this.$accessor,
        this.activateAccountFee,
      );

      this.transactionInfo.amount!.amount = txAmount.toString();
      this.transactionInfo.amount!.token = this.chosenToken as ZkInBalance;

      if (BigNumber.isBigNumber(calculatedFee)) {
        this.transactionInfo.fee!.amount = calculatedFee;
        this.transactionInfo.fee!.token = this.feeToken;
      }

      if (transferTransactions.cpkTransaction) {
        removeCPKTx(this.$accessor.account.address!);
        this.$accessor.wallet.setAccountLockedState(false);
        transferTransactions.cpkTransaction.awaitReceipt().then(async () => {
          const newAccountState = await walletData.get().syncWallet!.getAccountState();
          walletData.set({ accountState: newAccountState });
          this.$accessor.wallet.checkLockedState();
        });
      }

      this.transactionInfo.hash = transferTransactions.transaction!.txHash;
      this.transactionInfo.explorerLink = APP_ZKSYNC_BLOCK_EXPLORER + "/transactions/" + transferTransactions.transaction!.txHash;
      this.transactionInfo.fee!.amount = transferTransactions.feeTransaction?.txData.tx.fee;
      this.transactionInfo.recipient = {
        address: transferTransactions.transaction!.txData.tx.to,
        name: this.chosenContact ? this.chosenContact.name : "",
      };
      this.tip = "Waiting for the transaction to be mined...";
      const receipt = await transferTransactions.transaction!.awaitReceipt();
      this.transactionInfo.success = !!receipt.success;
      if (receipt.failReason) {
        throw new Error(receipt.failReason);
      }
    },
    async accountUnlocked(address: Address): Promise<boolean> {
      const state = await walletData.get().syncProvider!.getState(address);
      return state.id != null;
    },
    warningDialogProceedTransfer(): void {
      if (this.transferWithdrawWarningCheckmark) {
        localStorage.setItem("canceledTransferWithdrawWarning", "true");
      }
      this.commitTransaction();
      this.$nextTick(() => {
        setTimeout(() => {
          this.transferWithdrawWarningModal = false;
        }, 100);
      });
    },
    async getAccountActivationFee(): Promise<void> {
      if (!this.feeToken && !this.ownAccountUnlocked) {
        return;
      }
      this.activateAccountFeeLoading = true;
      const syncWallet = walletData.get().syncWallet;
      const syncProvider = walletData.get().syncProvider;
      try {
        await this.$accessor.wallet.restoreProviderConnection();
        const foundFee = await syncProvider?.getTransactionFee(
          {
            ChangePubKey: syncWallet!.ethSignerType?.verificationMethod === "ERC-1271" ? "Onchain" : "ECDSA",
          },
          syncWallet!.address() || "",
          this.feeToken.symbol,
        );
        this.activateAccountFee = foundFee!.totalFee.toString();
      } catch (error) {
        await this.$toast.global.zkException({
          message: error.message ?? "Error while receiving an unlock fee",
        });
      }
      this.activateAccountFeeLoading = false;
    },
    clearTransactionInfo() {
      this.transactionInfo = {
        success: false,
        continueBtnFunction: false,
        continueBtnText: "",
        hash: "",
        type: "",
        explorerLink: "",
        recipient: {
          address: "",
          name: "",
        },
        amount: {
          amount: "",
          token: false,
        },
        fee: {
          amount: "",
          token: this.feeToken,
        },
      };
    },
    setTransactionInfo(transaction: Transaction, continueAfter = false, btnText = "") {
      this.transactionInfo.continueBtnFunction = continueAfter;
      this.transactionInfo.hash = transaction.txHash;
      this.transactionInfo.continueBtnText = btnText;
      this.transactionInfo.explorerLink = APP_ZKSYNC_BLOCK_EXPLORER + "/transactions/" + transaction.txHash;
      this.transactionInfo.fee!.token = this.feeToken;
      this.transactionInfo.fee!.amount = transaction.txData.tx.fee;
      this.transactionInfo.amount = undefined;
      this.transactionInfo.recipient = undefined;
    },
    successBlockContinue() {
      if (this.error) {
        return;
      }
      this.clearTransactionInfo();
      this.commitTransaction();
    },
  },
});
</script>
