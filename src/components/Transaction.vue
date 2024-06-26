<template>
  <div class="transactionPage dappPageWrapper">
    <fee-calc-error />
    <fee-changed
      v-model="feeChangedModal.opened"
      :type="transactionTypeName"
      :changed-fees="feeChangedModal.changedFees"
      :can-proceed="!buttonDisabled"
      @back="feeChangedModal.opened = false"
      @proceed="commitTransaction()"
    />

    <!-- Choose token -->
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
      :continue-btn-link="type === 'nft-withdraw' || type === 'nft-transfer' ? '/account/nft' : '/account'"
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
      <address-input ref="addressInput" v-model="inputtedAddress" @enter="commitTransaction()" />
      <choose-contact v-model="chosenContact" class="_margin-top-05" :address.sync="inputtedAddress" :display-own-address="type === 'withdraw' || type === 'nft-withdraw'" />

      <template v-if="type === 'transfer' || type === 'withdraw'">
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
      </template>
      <template v-if="type === 'nft-transfer' || type === 'nft-withdraw'">
        <div class="_padding-top-1 inputLabel">Token</div>
        <nft-choose-token v-model="chosenToken" @input="chooseToken($event)" />
      </template>

      <!-- <i-radio-group
        v-if="chosenToken && (type === 'withdraw' || type === 'nft-withdraw') && (!chosenFeeToken || chosenFeeToken.symbol === chosenToken.symbol) && (feesObj || feesLoading) && inputtedAddress"
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

      <div class="errorText _text-center _margin-top-1" data-cy="transaction_error_text">
        {{ error }}
      </div>

      <i-button data-cy="transaction_withdraw_transfer_button" :disabled="buttonDisabled" block class="_margin-top-05" size="lg" variant="secondary" @click="commitTransaction()">
        <template v-if="ownAccountUnlocked">
          <v-icon v-if="type === 'withdraw' || type === 'nft-withdraw'" name="ri-hand-coin-fill" />
          <v-icon v-else-if="type === 'transfer' || type === 'nft-transfer'" class="planeIcon" name="ri-send-plane-fill" />
        </template>
        <span>
          <span>{{ transactionTypeName }}</span>
        </span>
      </i-button>

      <div v-if="!enoughFeeToken" class="errorText _text-center _margin-top-1" data-cy="transaction_error_text">
        Not enough <span class="tokenSymbol">{{ feeToken.symbol }}</span> to pay the fee
      </div>
      <div v-if="cantFindFeeToken === true && feesObj && chosenToken && inputtedAddress" class="errorText _text-center _margin-top-1">
        <span class="tokenSymbol">{{ chosenToken.symbol }}</span> is not suitable for paying fees<br />
        No available tokens on your balance to pay the fee
      </div>
      <div v-else>
        <div v-if="(chosenFeeObj || feesLoading) && chosenToken && inputtedAddress" class="_text-center _margin-top-1" data-cy="fee_block_fee_message">
          Fee:
          <span v-if="feesLoading" class="secondaryText">Loading...</span>
          <span v-else-if="feeToken">
            {{ feesObj && feesObj[transactionMode] | formatToken(feeToken.symbol) }} <span class="tokenSymbol">{{ feeToken.symbol }}</span>
            <span v-if="feesObj[transactionMode]" class="secondaryText">
              <token-price :symbol="feeToken.symbol" :amount="feesObj[transactionMode].toString()" />
            </span>
          </span>
        </div>
        <div
          v-if="!ownAccountUnlocked && feeToken && (activateAccountFee || activateAccountFeeLoading)"
          class="_text-center _margin-top-1-2"
          data-cy="fee_block_account_activation_message"
        >
          Account Activation single-time fee:
          <span v-if="activateAccountFeeLoading" class="secondaryText">Loading...</span>
          <span v-else-if="feeToken">
            {{ activateAccountFee | formatToken(feeToken.symbol) }} <span class="tokenSymbol">{{ feeToken.symbol }}</span>
            <span class="secondaryText">
              <token-price :symbol="feeToken.symbol" :amount="activateAccountFee.toString()" />
            </span>
          </span>
        </div>
        <div v-if="inputtedAddress || !ownAccountUnlocked" class="_text-center _margin-top-1-2">
          <span class="linkText" data-cy="fee_block_change_fee_token_button" @click="chooseFeeTokenModal = true">Change fee token</span>
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

import FeeCalcError from "@/blocks/modals/FeeCalcError.vue";
import FeeChanged from "@/blocks/modals/FeeChanged.vue";
import loadingBlock from "@/components/LoadingBlock.vue";
import successBlock from "@/components/SuccessBlock.vue";
import { APP_ZKSYNC_BLOCK_EXPLORER, ETHER_NETWORK_NAME } from "@/plugins/build";

import { GweiBalance, ZkInBalance, ZkInContact, ZkInFeesObj, ZkInNFT, ZkInTransactionInfo, ZKTypeTransactionType, ZkInFeeChange } from "@/types/lib";
import utils from "@/plugins/utils";
import { transaction, transferNFT, withdraw, withdrawNFT } from "@/plugins/walletActions/transaction";
import { getCPKTx } from "@/plugins/walletActions/cpk";
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
    FeeCalcError,
    FeeChanged,
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
      chosenToken: <ZkInBalance | ZkInNFT | false>false,
      chosenFeeToken: <ZkInBalance | false>false,
      feeChangedModal: {
        opened: false,
        changedFees: <ZkInFeeChange[]>[],
      },
      feesObj: <ZkInFeesObj | undefined>{
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
    chosenFeeObj(): BigNumberish | false {
      if (this.feesObj && this.transactionMode && !this.feesLoading) {
        const selectedFeeTypeAmount: string | BigNumber | ArrayLike<number> | bigint | number | undefined =
          this.transactionMode === "fast" ? this.feesObj.fast : this.feesObj.normal;
        if (!selectedFeeTypeAmount) {
          return BigNumber.from("0");
        }
        return BigNumber.from(selectedFeeTypeAmount);
      }
      return false;
    },
    transactionTypeName(): string {
      switch (this.type) {
        case "withdraw":
          return "Withdraw";
        case "transfer":
          return "Transfer";
        case "nft-withdraw":
          return "Withdraw NFT";
        case "nft-transfer":
          return "Transfer NFT";

        default:
          return "";
      }
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
        amount = (this.chosenToken as ZkInBalance).rawBalance.sub(this.chosenFeeObj as GweiBalance);
      } else {
        amount = (this.chosenToken as ZkInBalance).rawBalance;
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
      if (this.type === "nft-transfer" || this.type === "nft-withdraw") {
        return this.chosenFeeToken as ZkInBalance;
      }
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
      if (
        !this.feesObj ||
        !this.feesObj[this.transactionMode] ||
        (!this.ownAccountUnlocked && !(this.feeToken && this.activateAccountFee && !this.activateAccountFeeLoading && this.enoughFeeToken))
      ) {
        return true;
      }
      return (
        !this.inputtedAddress ||
        ((this.type === "withdraw" || this.type === "transfer") && !this.inputtedAmount) ||
        !this.chosenToken ||
        this.feesLoading ||
        this.cantFindFeeToken ||
        !this.enoughFeeToken
      );
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
      } else if (this.type === "withdraw" || this.type === "nft-withdraw") {
        this.inputtedAddress = this.$accessor.account.address!;
      }
      if (this.$route.query.token) {
        if (this.type === "transfer" || this.type === "withdraw") {
          const balances = this.$accessor.wallet.getzkBalances;
          for (const item of balances) {
            if (item.symbol === this.$route.query.token) {
              this.chooseToken(item);
              break;
            }
          }
        } else if (this.type === "nft-transfer" || this.type === "nft-withdraw") {
          const tokens = this.$accessor.wallet.getNftBalances;
          const tokenID = parseInt(this.$route.query.token as string);
          for (const item of tokens) {
            if (item.id === tokenID) {
              this.chooseToken(item);
              break;
            }
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
        await this.getAccountActivationFee();
      }
    } catch (error) {
      this.$sentry?.captureException(error);
    }
    this.loading = false;
  },
  methods: {
    chooseToken(token: ZkInBalance | ZkInNFT) {
      this.chosenToken = token;
      this.chooseTokenModal = false;
      this.transactionMode = "normal";
      const balances = <Array<ZkInBalance>>(
        JSON.parse(JSON.stringify(this.$accessor.wallet.getzkBalances)).sort((a: ZkInBalance, b: ZkInBalance) => parseFloat(b.balance as string) - parseFloat(a.balance as string))
      );
      if ((this.chosenToken as ZkInBalance).restricted || this.type === "nft-transfer" || this.type === "nft-withdraw") {
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
    async requestFees(force?: boolean): Promise<void> {
      if (!this.chosenToken || !this.inputtedAddress || !this.feeToken || this.feeToken.restricted) {
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
          force,
        };
        const requestedFee = await this.$accessor.wallet.requestFees(savedData);
        if (savedData.address === this.inputtedAddress && savedData.symbol === this.chosenToken?.symbol && savedData.feeSymbol === this.feeToken?.symbol) {
          this.feesObj = requestedFee;
        }
      } catch (error) {
        this.$toast.global.zkException({
          message: error.message,
        });
        console.log("Get fee error", error);
        this.handleFeeError();
      }
      this.feesLoading = false;
    },
    async getWithdrawalTime(): Promise<void> {
      this.withdrawTime = await this.$accessor.wallet.requestWithdrawalProcessingTime();
    },
    async commitTransaction(someData?: unknown): Promise<void> {
      if ((this.type === "transfer" || this.type === "withdraw") && !this.inputtedAmount) {
        // @ts-ignore: Unreachable code error
        (this.$refs.amountInput as Vue).emitValue(this.inputtedAmount);
      }
      if (this.buttonDisabled) {
        return;
      }
      this.error = "";
      this.loading = true;
      try {
        this.tip = "Processing...";
        const changedFees = <ZkInFeeChange[]>[];
        const oldFee = this.chosenFeeObj;
        await this.requestFees(true);
        const newFee = this.chosenFeeObj;
        if (BigNumber.from(oldFee).lt(newFee as BigNumberish)) {
          changedFees.push({
            headline: `Old ${this.transactionTypeName} fee`,
            symbol: this.feeToken.symbol,
            amount: <BigNumberish>oldFee.toString(),
          });
          changedFees.push({
            headline: `New ${this.transactionTypeName} fee`,
            symbol: this.feeToken.symbol,
            amount: <BigNumberish>newFee.toString(),
          });
        }
        if (!this.ownAccountUnlocked) {
          const oldActivationFee = this.activateAccountFee as string;
          await this.getAccountActivationFee();
          const newActivationFee = this.activateAccountFee as string;
          if (BigNumber.from(oldActivationFee).lt(newActivationFee as BigNumberish)) {
            changedFees.push({
              headline: "Old Account Activation fee",
              symbol: this.feeToken.symbol,
              amount: <BigNumberish>oldActivationFee.toString(),
            });
            changedFees.push({
              headline: "New Account Activation fee",
              symbol: this.feeToken.symbol,
              amount: <BigNumberish>newActivationFee.toString(),
            });
          }
        }
        if (changedFees.length > 0) {
          this.feeChangedModal = {
            opened: true,
            changedFees,
          };
          this.loading = false;
          return;
        }
        if (this.type === "withdraw") {
          await this.withdraw();
        } else if (this.type === "transfer") {
          await this.transfer(!!someData);
        } else if (this.type === "nft-transfer") {
          await this.nftTransfer(!!someData);
        } else if (this.type === "nft-withdraw") {
          await this.nftWithdraw();
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
      this.tip = "Follow the instructions in your Ethereum wallet";
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

      this.checkUnlock(withdrawTransactions);

      this.transactionInfo.hash = this.$options.filters!.formatTxHash(withdrawTransactions.transaction!.txHash) as string;
      this.transactionInfo.explorerLink = APP_ZKSYNC_BLOCK_EXPLORER + "/transactions/" + this.$options.filters!.formatTxHash(withdrawTransactions.transaction!.txHash);
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
    async transfer(skipAccountCheck: boolean): Promise<void> {
      const transferWithdrawWarning = localStorage.getItem("canceledTransferWithdrawWarning");
      this.tip = "Processing...";
      if (!transferWithdrawWarning && !skipAccountCheck) {
        const accountUnlocked = await this.accountUnlocked(this.inputtedAddress);
        if (!accountUnlocked) {
          this.transferWithdrawWarningModal = true;
          this.loading = false;
          return;
        }
      }
      this.tip = "Follow the instructions in your Ethereum wallet";

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

      this.checkUnlock(transferTransactions);

      this.transactionInfo.hash = this.$options.filters!.formatTxHash(transferTransactions.transaction!.txHash) as string;
      this.transactionInfo.explorerLink = APP_ZKSYNC_BLOCK_EXPLORER + "/transactions/" + this.$options.filters!.formatTxHash(transferTransactions.transaction!.txHash);
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
    async nftTransfer(skipAccountCheck: boolean): Promise<void> {
      const transferWithdrawWarning = localStorage.getItem("canceledTransferWithdrawWarning");
      this.tip = "Processing...";
      if (!transferWithdrawWarning && !skipAccountCheck) {
        const accountUnlocked = await this.accountUnlocked(this.inputtedAddress);
        if (!accountUnlocked) {
          this.transferWithdrawWarningModal = true;
          this.loading = false;
          return;
        }
      }
      this.tip = "Follow the instructions in your Ethereum wallet";

      const calculatedFee = this.chosenFeeObj;

      if (calculatedFee === undefined) {
        throw new Error("Fee calculation failed");
      }
      const transferTransactions = await transferNFT(
        this.inputtedAddress,
        this.chosenToken as ZkInNFT,
        this.feeToken.symbol,
        calculatedFee as string,
        this.$accessor,
        this.activateAccountFee,
      );

      this.transactionInfo.amount = undefined;

      if (BigNumber.isBigNumber(calculatedFee)) {
        this.transactionInfo.fee!.amount = calculatedFee;
        this.transactionInfo.fee!.token = this.feeToken;
      }

      this.checkUnlock(transferTransactions);

      this.transactionInfo.hash = this.$options.filters!.formatTxHash(transferTransactions.transaction!.txHash) as string;
      this.transactionInfo.explorerLink = APP_ZKSYNC_BLOCK_EXPLORER + "/transactions/" + this.$options.filters!.formatTxHash(transferTransactions.transaction!.txHash);
      this.transactionInfo.fee!.amount = transferTransactions.feeTransaction?.txData.tx.fee;
      this.transactionInfo.recipient = {
        address: transferTransactions.transaction!.txData.tx.to,
        name: this.chosenContact ? this.chosenContact.name : "",
      };
      this.tip = "Waiting for the transaction to be mined...";
      const receipt = await transferTransactions.transaction!.awaitReceipt();
      this.transactionInfo.success = !!receipt.success;
      this.$accessor.wallet.requestZkBalances({ accountState: undefined, force: true });
      if (receipt.failReason) {
        throw new Error(receipt.failReason);
      }
    },
    async nftWithdraw(): Promise<void> {
      this.tip = "Follow the instructions in your Ethereum wallet";
      if (this.feesObj === undefined) {
        throw new Error("Fee fetching error");
      }
      const withdrawTransactions = await withdrawNFT({
        address: this.inputtedAddress,
        token: this.chosenToken as ZkInNFT,
        feeToken: this.feeToken.symbol,
        fastWithdraw: this.transactionMode === "fast",
        fee: (this.transactionMode === "fast" ? this.feesObj?.fast : this.feesObj?.normal) as string,
        store: this.$accessor,
        accountActivationFee: this.activateAccountFee,
      });

      this.transactionInfo.amount = undefined;
      this.transactionInfo.fee!.token = this.feeToken;

      this.checkUnlock(withdrawTransactions);

      this.transactionInfo.hash = this.$options.filters!.formatTxHash(withdrawTransactions.transaction!.txHash) as string;
      this.transactionInfo.explorerLink = APP_ZKSYNC_BLOCK_EXPLORER + "/transactions/" + this.$options.filters!.formatTxHash(withdrawTransactions.transaction!.txHash);
      this.transactionInfo.fee!.amount = withdrawTransactions.feeTransaction!.txData.tx.fee;
      this.transactionInfo.recipient = {
        address: withdrawTransactions.transaction!.txData.tx.to,
        name: this.chosenContact ? this.chosenContact.name : "",
      };
      this.tip = "Waiting for the transaction to be mined...";
      const receipt = await withdrawTransactions.transaction?.awaitReceipt();
      this.transactionInfo.success = !!receipt!.success;
      this.$accessor.wallet.requestZkBalances({ accountState: undefined, force: true });
      if (receipt!.failReason) {
        throw new Error(receipt!.failReason);
      }
    },
    checkUnlock(transferTransactions: { cpkTransaction: Transaction | null; transaction: Transaction | null; feeTransaction: Transaction | null }): void {
      if (transferTransactions.cpkTransaction) {
        this.$accessor.wallet.checkLockedState();
        transferTransactions.cpkTransaction.awaitReceipt().then(async () => {
          const newAccountState = await walletData.get().syncWallet!.getAccountState();
          walletData.set({ accountState: newAccountState });
          this.$accessor.wallet.checkLockedState();
        });
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
      this.commitTransaction(true);
      this.transferWithdrawWarningModal = false;
    },
    async getAccountActivationFee(): Promise<void> {
      if (!this.feeToken && !this.ownAccountUnlocked) {
        return;
      }
      this.activateAccountFeeLoading = true;
      const syncWallet = walletData.get().syncWallet;
      const syncProvider = walletData.get().syncProvider;
      try {
        const foundFee = await syncProvider?.getTransactionFee(
          {
            ChangePubKey: { onchainPubkeyAuth: false },
          },
          syncWallet!.address() || "",
          this.feeToken.symbol,
        );
        this.activateAccountFee = foundFee!.totalFee.toString();
      } catch (error) {
        this.$toast.global.zkException({
          message: error.message,
        });
        console.log("Get account activation fee error", error);
        this.handleFeeError();
      }
      this.activateAccountFeeLoading = false;
    },
    handleFeeError() {
      this.$nextTick(() => {
        if (!this.$accessor.currentModal) {
          this.$accessor.openModal("FeeCalcError");
        }
      });
      this.chosenFeeToken = false;
      this.feesObj = undefined;
      this.activateAccountFee = undefined;
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
      this.transactionInfo.hash = this.$options.filters!.formatTxHash(transaction.txHash) as string;
      this.transactionInfo.continueBtnText = btnText;
      this.transactionInfo.explorerLink = APP_ZKSYNC_BLOCK_EXPLORER + "/transactions/" + this.$options.filters!.formatTxHash(transaction.txHash);
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
