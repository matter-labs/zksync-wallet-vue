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
        Link to the transaction <i class="fas fa-external-link" />
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
          <i class="far fa-long-arrow-alt-left"></i>
        </nuxt-link>
        <div>
          {{ transactionTypeName }}
        </div>
      </div>

      <div class="_padding-top-1 inputLabel">Address</div>
      <address-input ref="addressInput" v-model="inputtedAddress" @enter="commitTransaction()" />
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
        @enter="commitTransaction()"
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
            <span v-if="feesObj?.normal">
              {{ feesObj.normal | formatToken(feeToken.symbol) }}
              <span class="tokenSymbol">
                {{ feeToken.symbol }}
              </span>
              <span class="totalPrice">
                {{ feesObj.normal | formatUsdAmount(feeToken.tokenPrice, feeToken.symbol) }}
              </span>
            </span>
            <span v-else class="totalPrice">Loading...</span>
            ).
          </span>
          <br class="desktopOnly" />
          Processing time: {{ withdrawTime.normal | getTimeString }}
        </i-radio>
        <i-radio value="fast">
          Fast withdraw
          <span class="feeAmount">
            (
            <strong>Fee:</strong>
            <span v-if="feesObj?.fast">
              {{ feesObj.fast | formatToken(feeToken.symbol) }}
              <span class="tokenSymbol">{{ feeToken.symbol }}</span>
              <span class="totalPrice">
                {{ feesObj.fast | formatUsdAmount(feeToken.tokenPrice, feeToken.symbol) }}
              </span>
            </span>
            <span v-else class="totalPrice">Loading...</span>
            ).
          </span>
          <br class="desktopOnly" />
          Processing time: {{ withdrawTime.fast | getTimeString }}
        </i-radio>
      </i-radio-group>
      <div v-else-if="chosenToken && type === 'withdraw' && feesObj" class="secondaryText _text-center _margin-top-1">
        Only normal withdraw ({{ withdrawTime.normal | getTimeString }}) is available when using different fee token
      </div>

      <div class="errorText _text-center _margin-top-1">
        {{ error }}
      </div>

      <i-button :disabled="buttonDisabled" block class="_margin-top-1" size="lg" variant="secondary" @click="commitTransaction()">
        <template v-if="ownAccountUnlocked">
          <i v-if="type === 'withdraw'" class="fas fa-hand-holding-usd"></i>
          <i v-else-if="type === 'transfer'" class="fas fa-paper-plane"></i>
        </template>
        {{ !ownAccountUnlocked ? "Activate Account" : transactionTypeName }}
      </i-button>

      <div v-if="!enoughFeeToken" class="errorText _text-center _margin-top-1">
        Not enough <span class="tokenSymbol">{{ feeToken.symbol }}</span> to pay the fee
      </div>
      <div
        v-if="cantFindFeeToken === true && (transactionMode === 'normal' ? feesObj?.normal : feesObj?.fast) && chosenToken && inputtedAddress"
        class="errorText _text-center _margin-top-1"
      >
        <span class="tokenSymbol">{{ chosenToken.symbol }}</span> is not suitable for paying fees<br />
        No available tokens on your balance to pay the fee
      </div>
      <div v-else>
        <div v-if="((transactionMode === 'normal' ? feesObj?.normal : feesObj?.fast) || feesLoading) && chosenToken && inputtedAddress" class="_text-center _margin-top-1">
          Fee:
          <span v-if="feesLoading" class="secondaryText">Loading...</span>
          <span v-else>
            {{ (transactionMode === "normal" ? feesObj?.normal : feesObj?.fast) | formatToken(feeToken.symbol) }} <span class="tokenSymbol">{{ feeToken.symbol }}</span>
            <span class="secondaryText">
              {{ (transactionMode === "normal" ? feesObj?.normal : feesObj?.fast) | formatUsdAmount(feeToken.tokenPrice, feeToken.symbol) }}
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
        <div
          v-if="(((transactionMode === 'normal' ? feesObj?.normal : feesObj?.fast) || feesLoading) && chosenToken && inputtedAddress) || !ownAccountUnlocked"
          class="_text-center _margin-top-1"
        >
          <span class="linkText" @click="chooseFeeTokenModal = true">Choose fee token</span>
        </div>
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
import { Address, Balance, Contact, GweiBalance, Provider, FeesObj, Transaction, TransactionReceipt } from "@/plugins/types";
import utils from "@/plugins/utils";
import { transaction, withdraw } from "@/plugins/walletActions/transaction";
import { walletData } from "@/plugins/walletData";

import { BigNumber } from "ethers";
import { Vue } from "vue-property-decorator";

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
      },

      /* Warning Modal */
      transferWithdrawWarningModal: false,

      /* Main Block */
      inputtedAddress: "",
      chosenContact: false as false | Contact,
      inputtedAmount: "",
      chosenToken: false as Balance | false,
      chosenFeeToken: false as Balance | false,
      feesObj: undefined as undefined | FeesObj,
      feesLoading: false,
      transactionMode: "normal",
      cantFindFeeToken: false,
      withdrawTime: false,
      transferWithdrawWarningCheckmark: false,
      activateAccountFeeLoading: false,
      activateAccountFee: undefined as undefined | GweiBalance,
      error: "",
    };
  },
  computed: {
    transactionTypeName(): string {
      if (this.type === "withdraw") {
        return "Withdraw";
      } else return this.type === "transfer" ? "Transfer" : "";
    },
    maxAmount(): string {
      if (!this.chosenToken) {
        return "0";
      }
      if (!(this.transactionMode === "normal" ? this.feesObj?.normal : this.feesObj?.fast)) {
        return "0";
      }
      const currentFee = this.transactionMode === "fast" ? this.feesObj?.fast : this.feesObj?.normal;

      let amount =
        (!this.chosenFeeToken || this.chosenToken.symbol === this.chosenFeeToken.symbol) && !this.feesLoading
          ? this.chosenToken.rawBalance.sub(BigNumber.from(currentFee))
          : this.chosenToken.rawBalance;

      if (!this.ownAccountUnlocked && !this.activateAccountFeeLoading && this.activateAccountFee) {
        amount = amount.sub(this.activateAccountFee);
      }
      return zksync!.closestPackableTransactionAmount(amount.toString()).toString();
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
        // @ts-ignore: Unreachable code error
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
      // @ts-ignore: Unreachable code error
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
      return !this.$store.getters["wallet/isAccountLocked"];
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
      this.getFees();
    },
  },
  async mounted() {
    try {
      this.loading = true;
      if (this.$route.query.w) {
        this.inputtedAddress = this.$route.query.w.toString();
      }
      if (this.$route.query.token) {
        const balances = this.$store.getters["wallet/getzkBalances"] as Array<Balance>;
        for (const item of balances) {
          if (item.symbol === this.$route.query?.token) {
            this.chooseToken(item);
            break;
          }
        }
      }
      zksync = await walletData.zkSync();
      if (this.type === "withdraw") {
        await this.getWithdrawalTime();
      }
      if (!this.ownAccountUnlocked) {
        await this.getAccountActivationFee();
      }
      this.loading = false;
    } catch (error) {
      console.log(error);
      this.loading = false;
    }
  },
  methods: {
    chooseToken(token: Balance) {
      this.chosenToken = token;
      this.chooseTokenModal = false;
      this.transactionMode = "normal";
      const balances = JSON.parse(JSON.stringify(this.$store.getters["wallet/getzkBalances"])).sort(
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
      this.getFees();
      this.getAccountActivationFee();
    },
    chooseFeeToken(token: Balance) {
      this.chosenFeeToken = token;
      this.chooseFeeTokenModal = false;
      this.getFees();
      this.getAccountActivationFee();
    },
    async getFees(): Promise<void> {
      if (!this.chosenToken || !this.inputtedAddress || this.feeToken.restricted) {
        this.feesObj = undefined;
        return;
      }
      this.feesLoading = true;
      try {
        this.feesObj = await this.$store.dispatch("wallet/getFees", {
          address: this.inputtedAddress,
          symbol: this.chosenToken.symbol,
          feeSymbol: this.feeToken.symbol,
          type: this.type,
        });
      } catch (error) {
        await this.$store.dispatch("toaster/error", error.message);
      }
      this.feesLoading = false;
    },
    async getWithdrawalTime(): Promise<void> {
      this.withdrawTime = await this.$store.dispatch("wallet/getWithdrawalProcessingTime");
    },
    async commitTransaction(): Promise<void> {
      console.log(this.ownAccountUnlocked);
      if (!this.inputtedAmount && this.ownAccountUnlocked) {
        // @ts-ignore: Unreachable code error
        this.$refs.amountInput.emitValue(this.inputtedAmount);
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
        } else if (error.message && String(error.message).length < 60) {
          this.error = error.message;
        } else {
          this.error = "Transaction error";
        }
      }
      this.tip = "";
      this.loading = false;
    },
    async withdraw() {
      const syncProvider = walletData.get().syncProvider as Provider;
      const txAmount = utils.parseToken((this.chosenToken as Balance).symbol, this.inputtedAmount);
      this.tip = "Confirm the transaction to withdraw";
      if (this.feesObj === undefined) {
        throw new Error("Fee fetching error :(");
      }
      const withdrawTransaction = await withdraw({
        address: this.inputtedAddress,
        token: (this.chosenToken as Balance).symbol,
        feeToken: this.feeToken.symbol,
        amount: txAmount.toString(),
        fastWithdraw: this.transactionMode === "fast",
        fees: (this.transactionMode === "fast" ? this.feesObj?.fast : this.feesObj?.normal) as string,
        store: this.$store,
      });
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
    async transfer() {
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
      const txAmount = (await utils.parseToken((this.chosenToken as Balance).symbol, this.inputtedAmount)) as BigNumber;

      const transferTransaction = await transaction(
        this.inputtedAddress as string,
        (this.chosenToken as Balance).symbol as string,
        this.feeToken.symbol as string,
        txAmount.toString(),
        this.feesObj?.normal as string,
        this.$store,
      );
      this.transactionInfo.amount.amount = txAmount.toString();
      this.transactionInfo.amount.token = this.chosenToken as Balance;
      this.transactionInfo.fee.token = this.feeToken;
      let receipt = {} as TransactionReceipt;
      if (!transferTransaction) throw new Error("transferTransaction corrupted");
      if (!Array.isArray(transferTransaction)) {
        this.transactionInfo.hash = transferTransaction.txHash;
        this.transactionInfo.explorerLink = APP_ZKSYNC_BLOCK_EXPLORER + "/transactions/" + transferTransaction.txHash;
        this.transactionInfo.fee.amount = transferTransaction.txData.tx.fee;
        this.transactionInfo.recipient = {
          address: transferTransaction.txData.tx.to,
          name: this.chosenContact ? this.chosenContact.name : "",
        };
        this.tip = "Waiting for the transaction to be mined...";
        receipt = await transferTransaction.awaitReceipt();
      } else if (transferTransaction) {
        this.transactionInfo.hash = transferTransaction[0].txHash;
        this.transactionInfo.explorerLink = APP_ZKSYNC_BLOCK_EXPLORER + "/transactions/" + transferTransaction[0].txHash;
        this.transactionInfo.fee.amount = transferTransaction[1].txData.tx.fee;
        this.transactionInfo.recipient = {
          address: transferTransaction[0].txData.tx.to,
          name: this.chosenContact ? this.chosenContact.name : "",
        };
        this.tip = "Waiting for the transaction to be mined...";
        receipt = await transferTransaction[0].awaitReceipt();
      }
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
        await this.$store.dispatch("wallet/restoreProviderConnection");
        const foundFee = await syncProvider?.getTransactionFee(
          {
            ChangePubKey: {
              onchainPubkeyAuth: syncWallet?.ethSignerType?.verificationMethod === "ERC-1271",
            },
          },
          syncWallet?.address() || "",
          this.feeToken.symbol,
        );
        this.activateAccountFee = foundFee!.totalFee.toString();
      } catch (error) {
        await this.$store.dispatch("toaster/error", error.message ? error.message : "Error while receiving an unlock fee");
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
              feeToken: this.feeToken.symbol,
              nonce: "committed",
              onchainAuth: true,
            });
            console.log("changePubkey", changePubkey);
            await this.$store.dispatch("transaction/watchTransaction", { transactionHash: changePubkey.txHash, tokenSymbol: this.feeToken.symbol });
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
            await this.$store.dispatch("transaction/watchTransaction", { transactionHash: changePubkey.txHash, tokenSymbol: this.feeToken.symbol });
            this.setTransactionInfo(changePubkey, true);
            this.tip = "Waiting for the transaction to be mined...";
            await changePubkey.awaitReceipt();
          }
        }
        const isSigningKeySet = await syncWallet?.isSigningKeySet();
        this.$store.commit("wallet/setAccountLockedState", isSigningKeySet === false);

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
