<!--suppress ES6ShorthandObjectProperty -->
<template>
  <div class="transactionPage">
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
          <i class="ri-arrow-left-line"></i>
        </nuxt-link>
        <div>
          {{ transactionTypeName }}
        </div>
      </div>

      <div class="_padding-top-1 inputLabel">Address</div>
      <address-input ref="addressInput" v-model="inputtedAddress" @enter="commitTransaction" />
      <choose-contact v-model="chosenContact" :address.sync="inputtedAddress" :display-own-address="type === 'withdraw'" />

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

      <i-radio-group
        v-if="chosenToken && type === 'withdraw' && (!chosenFeeToken || chosenFeeToken.symbol === chosenToken.symbol) && feesObj"
        v-model="transactionMode"
        class="_margin-top-2"
      >
        <i-radio value="normal">
          Normal withdraw
          <span class="feeAmount">
            (
            <strong>Fee:</strong>
            <span v-if="feesObj && feesObj.normal">
              {{ feesObj && feesObj.normal | formatToken(feeToken.symbol) }}
              <span class="tokenSymbol">
                {{ feeToken.symbol }}
              </span>
              <span class="totalPrice">
                {{ feesObj && feesObj.normal | formatUsdAmount(feeToken.tokenPrice, feeToken.symbol) }}
              </span>
            </span>
            <span v-else class="totalPrice">Loading...</span>
            ).
          </span>
          <br class="desktopOnly" />
          Processing time: {{ withdrawTime.normal | formatDateTime }}
        </i-radio>
        <i-radio value="fast">
          Fast withdraw
          <span class="feeAmount">
            (
            <strong>Fee:</strong>
            <span v-if="feesObj && feesObj['fast']">
              {{ feesObj && feesObj["fast"] | formatToken(feeToken.symbol) }}
              <span class="tokenSymbol">{{ feeToken.symbol }}</span>
              <span class="totalPrice">
                {{ feesObj && feesObj["fast"] | formatUsdAmount(feeToken.tokenPrice, feeToken.symbol) }}
              </span>
            </span>
            <span v-else class="totalPrice">Loading...</span>
            ).
          </span>
          <br class="desktopOnly" />
          Processing time: {{ withdrawTime.fast | formatDateTime }}
        </i-radio>
      </i-radio-group>
      <div v-else-if="chosenToken && type === 'withdraw' && feesObj" class="secondaryText _text-center _margin-top-1">
        Only normal withdraw ({{ withdrawTime.normal | formatDateTime }}) is available when using different fee token
      </div>

      <div class="errorText _text-center _margin-top-1">
        {{ error }}
      </div>

      <i-button :disabled="buttonDisabled" block class="_margin-top-1" size="lg" variant="secondary" @click="commitTransaction">
        <template v-if="ownAccountUnlocked">
          <i v-if="type === 'withdraw'" class="ri-hand-coin-fill"></i>
          <i v-else-if="type === 'transfer'" class="ri-send-plane-fill"></i>
        </template>
        {{ !ownAccountUnlocked ? "Activate Account" : transactionTypeName }}
      </i-button>

      <div v-if="!enoughFeeToken" class="errorText _text-center _margin-top-1">
        Not enough <span class="tokenSymbol">{{ feeToken.symbol }}</span> to pay the fee
      </div>
      <div v-if="cantFindFeeToken === true && feesObj && chosenToken && inputtedAddress" class="errorText _text-center _margin-top-1">
        <span class="tokenSymbol">{{ chosenToken.symbol }}</span> is not suitable for paying fees<br />
        No available tokens on your balance to pay the fee
      </div>
      <div v-else>
        <div v-if="chosenFeeObj && chosenToken && inputtedAddress" class="_text-center _margin-top-1">
          Fee:
          <span v-if="feesLoading" class="secondaryText">Loading...</span>
          <span v-else>
            {{ feesObj && feesObj[transactionMode] | formatToken(feeToken.symbol) }} <span class="tokenSymbol">{{ feeToken.symbol }}</span>
            <span class="secondaryText">
              {{ feesObj && feesObj[transactionMode] | formatUsdAmount(feeToken.tokenPrice, feeToken.symbol) }}
            </span>
          </span>
        </div>
        <div v-if="!ownAccountUnlocked && feeToken && (activateAccountFee || activateAccountFeeLoading)" class="_text-center _margin-top-1">
          Account Activation:
          <span v-if="activateAccountFeeLoading" class="secondaryText">Loading...</span>
          <span v-else>
            {{ activateAccountFee | formatToken(feeToken.symbol) }} <span class="tokenSymbol">{{ feeToken.symbol }}</span>
            <span class="secondaryText">
              {{ activateAccountFee | formatUsdAmount(feeToken.tokenPrice, feeToken.symbol) }}
            </span>
          </span>
        </div>
        <div v-if="(((feesObj && feesObj[transactionMode]) || feesLoading) && chosenToken && inputtedAddress) || !ownAccountUnlocked" class="_text-center _margin-top-1">
          <span class="linkText" @click="chooseFeeTokenModal = true">Choose fee token</span>
        </div>
      </div>
      <div v-if="type === 'withdraw'" class="totalPrice _display-flex _justify-center">
        <i-tooltip>
          <div class="_display-inline-flex">
            Estimated processing time: 5 hours
            <i class="ri-question-mark withdrawalAnnounce" />
          </div>
          <div slot="body">Despite all the capabilities of ZK and L2, full withdrawal process may take up to 5 hours and depends on L1</div>
        </i-tooltip>
      </div>
      <p v-if="!ownAccountUnlocked" class="tileTextBg _margin-top-1">
        To start using your account you need to register your public key once. This operation costs 15000 gas on-chain. In the future, we will eliminate this step by verifying ETH
        signatures with zero-knowledge proofs. Please bear with us!
      </p>
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
import { APP_ZKSYNC_BLOCK_EXPLORER } from "@/plugins/build";
import { Address, Balance, Contact, FeesObj, GweiBalance, Provider, TokenSymbol, Transaction, TransactionInfo, TransactionReceipt } from "@/plugins/types";
import utils from "@/plugins/utils";
import { transaction, withdraw } from "@/plugins/walletActions/transaction";
import { walletData } from "@/plugins/walletData";

import { BigNumber } from "ethers";
import Vue from "vue";
import Balances from "~/blocks/Balances.vue";

let zksync = null as any;

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
      default: "",
      required: true,
    },
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
        hash: "",
        type: "",
        explorerLink: "",
        recipient: {
          address: "" as Address,
          name: "",
        } as any,
        amount: {
          amount: "" as GweiBalance,
          token: false as false | Balance,
        } as any,
        fee: {
          amount: "" as GweiBalance,
          token: false as false | Balance,
        },
      } as TransactionInfo,

      /* Warning Modal */
      transferWithdrawWarningModal: false,

      /* Main Block */
      inputtedAddress: "",
      chosenContact: false as false | Contact,
      inputtedAmount: "",
      chosenToken: false as Balance | false,
      chosenFeeToken: false as Balance | false,
      feesObj: {
        normal: "",
        fast: "",
      } as FeesObj | false,
      feesLoading: false,
      transactionMode: "normal" as "normal" | "fast",
      cantFindFeeToken: false,
      withdrawTime: {
        normal: 0 as number,
        fast: 0 as number,
      },
      transferWithdrawWarningCheckmark: false,
      activateAccountFeeLoading: false,
      activateAccountFee: undefined as undefined | GweiBalance,
      error: "",
    };
  },
  computed: {
    chosenFeeObj(): GweiBalance | boolean {
      if (this.feesObj && this.transactionMode && !this.loading && !this.feesLoading) {
        if (this.feesObj.hasOwnProperty(this.transactionMode)) {
          return (this.feesObj as FeesObj)[this.transactionMode] as string;
        } else {
          return false;
        }
      }
      return false;
    },
    transactionTypeName(): string {
      if (this.type === "withdraw") {
        return "Withdraw";
      } else return this.type === "transfer" ? "Transfer" : "";
    },
    maxAmount(): string {
      if (!this.chosenToken) {
        return "0";
      }
      if (
        (!this.chosenFeeToken || this.chosenToken.symbol === this.chosenFeeToken.symbol) &&
        !this.feesLoading &&
        (this.transactionMode === "normal" ? (this.feesObj as FeesObj)?.normal : (this.feesObj as FeesObj)?.fast)
      ) {
        let amount = this.chosenToken.rawBalance.sub(this.chosenFeeObj as string);
        if (!this.ownAccountUnlocked && !this.activateAccountFeeLoading && this.activateAccountFee) {
          amount = amount.sub(this.activateAccountFee as string);
        }
        return zksync!.closestPackableTransactionAmount(amount).toString();
      } else {
        let amount = this.chosenToken.rawBalance;
        if (!this.ownAccountUnlocked && !this.activateAccountFeeLoading && this.activateAccountFee) {
          amount = amount.sub(this.activateAccountFee);
        }
        return zksync!.closestPackableTransactionAmount(amount).toString();
      }
    },
    feeToken(): Balance {
      if (this.chosenFeeToken) {
        return this.chosenFeeToken;
      } else {
        return this.chosenToken as Balance;
      }
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
      if (!this.ownAccountUnlocked) {
        return !(this.feeToken && this.activateAccountFee && !this.activateAccountFeeLoading && this.enoughFeeToken);
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
      zksync = await walletData.zkSync();
      if (this.type === "withdraw") {
        await this?.getWithdrawalTime();
      }
      if (!this.ownAccountUnlocked) {
        await this?.getAccountActivationFee();
      }
    } catch (error) {
      this?.$sentry.captureException(error);
    }
    this.loading = false;
  },
  methods: {
    chooseToken(token: Balance) {
      this.chosenToken = token;
      this.chooseTokenModal = false;
      this.transactionMode = "normal";
      const balances = JSON.parse(JSON.stringify(this.$accessor.wallet.getzkBalances)).sort(
        (a: Balance, b: Balance) => parseFloat(b.balance) - parseFloat(a.balance),
      ) as Array<Balance>;
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
    chooseFeeToken(token: Balance) {
      this.chosenFeeToken = token;
      this.chooseFeeTokenModal = false;
      this.requestFees();
      this.getAccountActivationFee();
    },
    async requestFees(): Promise<void> {
      if (!this.chosenToken || !this.inputtedAddress || this.feeToken?.restricted) {
        this.feesObj = false;
        return;
      }
      this.feesLoading = true;
      try {
        console.log({
          address: this.inputtedAddress,
          symbol: this.chosenToken?.symbol,
          feeSymbol: this.feeToken?.symbol,
          type: this.type,
        });
        this.feesObj = await this.$accessor.wallet.requestFees({
          address: this.inputtedAddress,
          symbol: this.chosenToken?.symbol,
          feeSymbol: this.feeToken?.symbol,
          type: this.type,
        });
      } catch (error) {
        await this.$accessor.toaster.error(error.message);
      }
      this.feesLoading = false;
    },
    async getWithdrawalTime(): Promise<void> {
      this.withdrawTime = await this.$accessor.wallet.requestWithdrawalProcessingTime();
    },
    async commitTransaction(): Promise<void> {
      if (!this.inputtedAmount && this.ownAccountUnlocked) {
        // @ts-ignore: Unreachable code error
        (this.$refs.amountInput as Vue).emitValue(this.inputtedAmount);
      }
      if (this.buttonDisabled) {
        return;
      }
      this.error = "";
      this.loading = true;
      try {
        if (!this.ownAccountUnlocked) {
          await this.activateAccount();
        } else if (this.type === "withdraw") {
          await this.withdraw();
        } else if (this.type === "transfer") {
          await this.transfer();
        }
      } catch (error) {
        if (error.message) {
          if (error.message.includes("User denied")) {
            this.error = "";
          } else if (error.message.includes("Fee Amount is not packable")) {
            this.error = "Fee Amount is not packable";
          } else if (error.message.includes("Transaction Amount is not packable")) {
            this.error = "Transaction Amount is not packable";
          } else if (error.message && String(error.message).length < 60) {
            this.error = error.message;
          }
        } else if (error.message && (error.message as string).length < 60) {
          this.error = error.message;
        } else {
          this.error = "Transaction error";
        }
      }
      this.tip = "";
      this.loading = false;
    },
    async withdraw(): Promise<void> {
      const syncProvider = walletData.get().syncProvider as Provider;
      const txAmount = utils.parseToken((this.chosenToken as Balance).symbol, this.inputtedAmount);
      this.tip = "Confirm the transaction to withdraw";
      if (this.feesObj === undefined) {
        throw new Error("Fee fetching error :(");
      }
      const withdrawTransaction = (await withdraw({
        address: this.inputtedAddress,
        token: (this.chosenToken as Balance).symbol,
        feeToken: this.feeToken.symbol,
        amount: txAmount.toString(),
        fastWithdraw: this.transactionMode === "fast",
        fees: (this.transactionMode === "fast" ? (this.feesObj as FeesObj)?.fast : (this.feesObj as FeesObj)?.normal) as string,
        store: this.$accessor,
      })) as Transaction;
      let receipt: TransactionReceipt;
      this.transactionInfo.amount.amount = txAmount.toString();
      this.transactionInfo.amount.token = this.chosenToken as Balance;
      this.transactionInfo.fee.token = this.feeToken;
      if (!Array.isArray(withdrawTransaction)) {
        this.transactionInfo.hash = withdrawTransaction.txHash;
        this.transactionInfo.explorerLink = APP_ZKSYNC_BLOCK_EXPLORER + "/transactions/" + withdrawTransaction.txHash;
        this.transactionInfo.fee.amount = withdrawTransaction.txData.tx.fee;
        this.transactionInfo.recipient = {
          address: withdrawTransaction.txData.tx.to,
          name: this.chosenContact ? this.chosenContact.name : "",
        };
        this.tip = "Waiting for the transaction to be mined...";
        receipt = await withdrawTransaction.awaitReceipt();
      } else {
        this.transactionInfo.hash = withdrawTransaction[0].txHash;
        this.transactionInfo.explorerLink = APP_ZKSYNC_BLOCK_EXPLORER + "/transactions/" + withdrawTransaction[0].txHash;
        this.transactionInfo.fee.amount = withdrawTransaction[1].txData.tx.fee;
        this.transactionInfo.recipient = {
          address: withdrawTransaction[0].txData.tx.to as string,
          name: this.chosenContact ? this.chosenContact.name : "",
        };
        this.tip = "Waiting for the transaction to be mined...";
        receipt = await syncProvider.notifyTransaction(withdrawTransaction[0].txHash, "COMMIT");
      }
      this.transactionInfo.success = receipt.success as boolean;
      if (receipt.failReason) {
        throw new Error(receipt.failReason);
      }
    },
    async transfer(): Promise<void> {
      const transferWithdrawWarning = localStorage.getItem("canceledTransferWithdrawWarning");
      if (!transferWithdrawWarning && !this.transferWithdrawWarningModal) {
        const accountUnlocked = await this.accountUnlocked(this.inputtedAddress);
        if (!accountUnlocked) {
          this.transferWithdrawWarningModal = true;
          this.loading = false;
          return;
        }
      }
      this.tip = "Confirm the transaction to transfer";

      const calculatedFee: GweiBalance | boolean = this.chosenFeeObj;

      if (calculatedFee === false) {
        throw new Error("Fee calculation failed");
      }

      const txAmount = utils.parseToken((this.chosenToken as Balance).symbol, this.inputtedAmount);
      const transferTransaction: Transaction | Transaction[] = await transaction(
        this.inputtedAddress as Address,
        (this.chosenToken as Balance).symbol as TokenSymbol,
        this.feeToken.symbol as TokenSymbol,
        txAmount.toString() as GweiBalance,
        calculatedFee as GweiBalance,
        this.$accessor,
      );

      this.transactionInfo.amount.amount = txAmount.toString() as GweiBalance;
      this.transactionInfo.amount.token = this.chosenToken as Balance;
      this.transactionInfo.fee.amount = calculatedFee as TokenSymbol;
      this.transactionInfo.fee.token = this.feeToken;

      const receivedTransaction: Transaction | undefined = transferTransaction.hasOwnProperty("txData")
        ? (transferTransaction as Transaction)
        : (transferTransaction as Transaction[]).shift();

      if (receivedTransaction === undefined) {
        throw new Error("Wrong transaction type");
      }

      this.transactionInfo.hash = receivedTransaction.txHash as string;
      this.transactionInfo.explorerLink = APP_ZKSYNC_BLOCK_EXPLORER + "/transactions/" + receivedTransaction.txHash;
      this.transactionInfo.fee.amount = receivedTransaction.txData.tx.fee;
      this.transactionInfo.recipient = {
        address: receivedTransaction.txData.tx.to,
        name: this.chosenContact ? this.chosenContact.name : "",
      };
      this.tip = "Waiting for the transaction to be mined...";
      const receipt: TransactionReceipt = await receivedTransaction.awaitReceipt();
      this.transactionInfo.success = receipt.success as boolean;
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
            ChangePubKey: syncWallet?.ethSignerType?.verificationMethod === "ERC-1271" ? "Onchain" : "ECDSA",
          },
          syncWallet?.address() || "",
          this.feeToken.symbol,
        );
        this.activateAccountFee = foundFee!.totalFee.toString();
      } catch (error) {
        await this.$accessor.toaster.error(error.message ? error.message : "Error while receiving an unlock fee");
      }
      this.activateAccountFeeLoading = false;
    },
    async activateAccount(): Promise<string> {
      if (this.activateAccountFee === undefined || !this.feeToken) {
        return "";
      }
      this.error = "";
      this.loading = true;
      try {
        this.clearTransactionInfo();
        const syncWallet = walletData.get().syncWallet;
        await this.$accessor.wallet.restoreProviderConnection();
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
              feeToken: this.feeToken.symbol,
              nonce: "committed",
              onchainAuth: true,
            });
            console.log("changePubkey", changePubkey);
            await this.$accessor.transaction.watchTransaction({ transactionHash: changePubkey.txHash, tokenSymbol: this.feeToken.symbol });
            this.setTransactionInfo(changePubkey, true);
            this.tip = "Waiting for the transaction to be mined...";
            await changePubkey?.awaitReceipt();
          }
        } else {
          const isSigningKeySet = await syncWallet!.isSigningKeySet();
          if (!isSigningKeySet) {
            const changePubkey = await syncWallet!.setSigningKey({
              feeToken: this.feeToken.symbol,
            });
            console.log("changePubkey", changePubkey);
            await this.$accessor.transaction.watchTransaction({ transactionHash: changePubkey.txHash, tokenSymbol: this.feeToken.symbol });
            this.setTransactionInfo(changePubkey, true);
            this.tip = "Waiting for the transaction to be mined...";
            await changePubkey.awaitReceipt();
          }
        }
        const isSigningKeySet = await syncWallet?.isSigningKeySet();
        this.$accessor.wallet.setAccountLockedState(isSigningKeySet === false);

        const newAccountState = await syncWallet?.getAccountState();
        walletData.set({ accountState: newAccountState });

        this.transactionInfo.success = true;
      } catch (error) {
        if (error.message && !error.message.includes("User denied")) {
          this.error = error.message;
        }
      }
      this.loading = false;
      return "";
    },
    clearTransactionInfo() {
      this.transactionInfo = {
        success: false,
        continueBtnFunction: false,
        hash: "",
        type: "",
        explorerLink: "",
        recipient: {
          address: "" as Address,
          name: "",
        },
        amount: {
          amount: "" as GweiBalance,
          token: false as false | Balance,
        },
        fee: {
          amount: "" as GweiBalance,
          token: this.feeToken as false | Balance,
        },
      };
    },
    setTransactionInfo(transaction: Transaction, continueAfter = false) {
      this.transactionInfo.continueBtnFunction = continueAfter;
      this.transactionInfo.hash = transaction.txHash;
      this.transactionInfo.explorerLink = APP_ZKSYNC_BLOCK_EXPLORER + "/transactions/" + transaction.txHash;
      this.transactionInfo.fee.token = this.feeToken;
      this.transactionInfo.fee.amount = transaction.txData.tx.fee;
      this.transactionInfo.amount = undefined;
      this.transactionInfo.recipient = undefined;
      this.transactionInfo.type = "ActivateAccount";
    },
    successBlockContinue() {
      this.clearTransactionInfo();
      this.chosenToken = false;
      this.chosenFeeToken = false;
    },
  },
});
</script>
