<template>
  <div class="transactionPage depositPage dappPageWrapper">
    <content-hash-modal />
    <fee-calc-error />
    <fee-changed
      v-model="feeChangedModal.opened"
      type="Mint NFT"
      :changed-fees="feeChangedModal.changedFees"
      :can-proceed="!buttonDisabled"
      @back="feeChangedModal.opened = false"
      @proceed="commitTransaction()"
    />

    <!-- Choose fee token -->
    <i-modal v-model="chooseFeeTokenModal" size="md">
      <template slot="header">Choose fee token</template>
      <block-choose-token :only-allowed="true" @chosen="chooseFeeToken($event)" />
    </i-modal>

    <!-- Loading block -->
    <loading-block v-if="loading === true" headline="Minting NFT">
      <a v-if="transactionInfo.hash" :href="transactionInfo.explorerLink" class="_display-block _text-center" target="_blank">
        Link to the transaction
        <v-icon name="ri-external-link-line" class="_margin-left-05" />
      </a>
      <p v-if="tip" class="_display-block _text-center">{{ tip }}</p>
    </loading-block>

    <!-- Transaction success block -->
    <success-block
      v-else-if="transactionInfo.success === true"
      :fee="transactionInfo.fee"
      :tx-link="transactionInfo.explorerLink"
      continue-btn-link="/account/nft"
      headline="NFT Minted successfully"
    >
      <p class="_text-center _margin-top-0">
        Your NFT mint transaction has been mined and will be processed after required number of confirmations.<br />Use the transaction link to track the progress.
      </p>
    </success-block>

    <!-- Main Block -->
    <div v-else class="transactionTile tileBlock">
      <div class="tileHeadline withBtn h3">
        <nuxt-link class="_icon-wrapped -rounded -sm returnBtn _display-flex" :to="fromRoute && fromRoute.fullPath !== $route.fullPath ? fromRoute : '/account'">
          <v-icon name="ri-arrow-left-line" scale="1" />
        </nuxt-link>
        <div>Mint NFT</div>
      </div>

      <div class="_padding-top-1 inputLabel">Address</div>
      <address-input ref="addressInput" v-model="inputtedAddress" @enter="commitTransaction" />
      <block-choose-contact v-model="chosenContact" class="_margin-top-05" :address.sync="inputtedAddress" display-own-address />

      <div class="_padding-top-1 inputLabel _display-flex _align-items-center">
        <div>Content Hash</div>
        <div class="icon-container _display-flex" @click="openContentHashModal">
          <v-icon name="ri-question-mark" class="iconInfo" scale="0.9" />
        </div>
      </div>
      <hash-input ref="hashInput" v-model="inputtedHash" class="_margin-bottom-2" autofocus @enter="commitTransaction()" />

      <div v-if="error" class="errorText _text-center _margin-top-1">{{ error }}</div>

      <i-button :disabled="buttonDisabled" block class="_margin-top-1 _display-flex flex-row" size="lg" variant="secondary" @click="commitTransaction()">
        <v-icon name="bi-download" scale="1.35" />&nbsp;&nbsp;Mint
      </i-button>
      <div v-if="!enoughFeeToken" class="errorText _text-center _margin-top-1">
        Not enough <span class="tokenSymbol">{{ chosenFeeToken.symbol }}</span> to pay the fee
      </div>
      <div v-if="cantFindFeeToken === true" class="errorText _text-center _margin-top-1">No available tokens on your balance to pay the fee</div>
      <div v-if="chosenFeeToken && inputtedAddress" class="_text-center _margin-top-1">
        Fee:
        <span v-if="feesLoading" class="secondaryText">Loading...</span>
        <span v-else-if="fee !== false">
          {{ fee | formatToken(chosenFeeToken.symbol) }} <span class="tokenSymbol">{{ chosenFeeToken.symbol }}</span>
          <span class="secondaryText">
            <token-price :symbol="chosenFeeToken.symbol" :amount="fee.toString()" />
          </span>
        </span>
      </div>
      <div v-if="!ownAccountUnlocked && chosenFeeToken && (activateAccountFee || activateAccountFeeLoading)" class="_text-center _margin-top-1-2">
        Account Activation single-time fee:
        <span v-if="activateAccountFeeLoading" class="secondaryText">Loading...</span>
        <span v-else-if="chosenFeeToken">
          {{ activateAccountFee | formatToken(chosenFeeToken.symbol) }} <span class="tokenSymbol">{{ chosenFeeToken.symbol }}</span>
          <span class="secondaryText">
            <token-price :symbol="chosenFeeToken.symbol" :amount="activateAccountFee.toString()" />
          </span>
        </span>
      </div>
      <span class="linkText _width-100 _display-block _text-center _margin-top-05" data-cy="fee_block_change_fee_token_button" @click="chooseFeeTokenModal = true"
        >Change fee token</span
      >
    </div>
  </div>
</template>

<script lang="ts">
import { Address } from "zksync/build/types";
import { Transaction } from "zksync/build/wallet";
import { APP_ZKSYNC_BLOCK_EXPLORER } from "@/plugins/build";
import utils from "@/plugins/utils";
import { walletData } from "@/plugins/walletData";
import ContentHashModal from "@/blocks/modals/ContentHashModal.vue";
import FeeCalcError from "@/blocks/modals/FeeCalcError.vue";
import FeeChanged from "@/blocks/modals/FeeChanged.vue";
import { getCPKTx } from "@/plugins/walletActions/cpk";
import Context from "@nuxt/types";
import { Route } from "vue-router/types";
import { mintNFT } from "@/plugins/walletActions/transaction";
import { GweiBalance, Hash, ZkInBalance, ZkInContact, ZkInTransactionInfo, ZkInFeesObj, ZkInFeeChange } from "@/types/lib";
import Vue from "vue";
import { BigNumber, BigNumberish } from "ethers";

export default Vue.extend({
  components: {
    ContentHashModal,
    FeeCalcError,
    FeeChanged,
  },
  asyncData({ from, app }: Context.Context): { fromRoute: Route } {
    if (from) {
      app.$accessor.setPreviousRoute({ path: from.path, query: from.query, params: from.params } as Route);
    }
    return {
      fromRoute: from,
    };
  },
  data() {
    return {
      /* Loading block */
      loading: false,
      tip: "",

      /* Choose fee token */
      cantFindFeeToken: false,
      chooseFeeTokenModal: false,

      /* Transaction success block */
      transactionInfo: <ZkInTransactionInfo>{
        success: false,
        type: "",
        hash: "",
        explorerLink: "",
        fee: {
          amount: "",
          token: false,
        },
      },

      /* Main Block */
      inputtedAddress: <Address>this.$accessor.provider.address!,
      chosenContact: <ZkInContact | false>false,
      inputtedHash: <Hash>"",
      fee: <GweiBalance | string>"",
      chosenFeeToken: <ZkInBalance | false>false,
      feeChangedModal: {
        opened: false,
        changedFees: <ZkInFeeChange[]>[],
      },
      feesLoading: false,
      activateAccountFeeLoading: false,
      activateAccountFee: <GweiBalance | undefined>undefined,
      error: "",
    };
  },
  computed: {
    buttonDisabled(): boolean {
      return (
        !this.inputtedHash ||
        !this.inputtedAddress ||
        !this.fee ||
        !this.enoughFeeToken ||
        this.feesLoading ||
        this.activateAccountFeeLoading ||
        (!this.activateAccountFee && !this.ownAccountUnlocked) ||
        !this.chosenFeeToken ||
        this.chosenFeeToken?.restricted
      );
    },
    ownAccountUnlocked(): boolean {
      return !this.$accessor.wallet.isAccountLocked;
    },
    enoughFeeToken(): boolean {
      if (this.cantFindFeeToken || !this.inputtedAddress || !this.fee || !this.chosenFeeToken || this.feesLoading) {
        return true;
      }
      let feeAmount = BigNumber.from(this.fee);
      if (!this.ownAccountUnlocked && !this.activateAccountFeeLoading && this.activateAccountFee) {
        feeAmount = feeAmount.add(this.activateAccountFee);
      }
      return BigNumber.from(this.chosenFeeToken.rawBalance).gt(feeAmount);
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
    chosenFeeToken: {
      deep: true,
      handler() {
        this.requestFees();
        this.getAccountActivationFee();
      },
    },
  },
  async mounted() {
    this.loading = true;
    this.chooseFeeToken();
    try {
      if (!this.ownAccountUnlocked) {
        try {
          getCPKTx(this.$accessor.provider.address!); /* will throw an error if no cpk tx found */
        } catch (error) {
          const accountID = await walletData.get().syncWallet!.getAccountId();
          if (typeof accountID === "number") {
            this.$accessor.openModal("SignPubkey");
          }
        }
      }
    } catch (error) {
      console.warn("Mounted error", error);
      this.$sentry?.captureException(error);
    }
    this.loading = false;
  },
  methods: {
    chooseFeeToken(token?: ZkInBalance) {
      if (token) {
        this.chosenFeeToken = token;
        this.cantFindFeeToken = false;
        this.chooseFeeTokenModal = false;
      } else {
        const balances = <Array<ZkInBalance>>(
          JSON.parse(JSON.stringify(this.$accessor.wallet.getzkBalances)).sort(
            (a: ZkInBalance, b: ZkInBalance) => parseFloat(b.balance as string) - parseFloat(a.balance as string),
          )
        );
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
      }
    },
    async commitTransaction(): Promise<void> {
      if (this.buttonDisabled) {
        return;
      }
      this.error = "";
      this.loading = true;
      try {
        this.tip = "Processing...";
        const changedFees = <ZkInFeeChange[]>[];
        const oldFee = this.fee;
        await this.requestFees(true);
        const newFee = this.fee;
        if (BigNumber.from(oldFee).lt(newFee as BigNumberish)) {
          changedFees.push({
            headline: "Old Mint NFT fee",
            symbol: (this.chosenFeeToken as ZkInBalance).symbol,
            amount: <BigNumberish>oldFee.toString(),
          });
          changedFees.push({
            headline: "New Mint NFT fee",
            symbol: (this.chosenFeeToken as ZkInBalance).symbol,
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
              symbol: (this.chosenFeeToken as ZkInBalance).symbol,
              amount: <BigNumberish>oldActivationFee.toString(),
            });
            changedFees.push({
              headline: "New Account Activation fee",
              symbol: (this.chosenFeeToken as ZkInBalance).symbol,
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
        await this.mint();
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
    async mint(): Promise<void> {
      this.tip = "Follow the instructions in your Ethereum wallet";
      this.transactionInfo.type = "deposit";
      const transferTransactions = await mintNFT(
        this.inputtedAddress,
        this.inputtedHash,
        (this.chosenFeeToken as ZkInBalance).symbol,
        this.fee as GweiBalance,
        this.$accessor,
        this.activateAccountFee,
      );

      this.transactionInfo.amount = undefined;

      if (BigNumber.isBigNumber(this.fee)) {
        this.transactionInfo.fee!.amount = this.fee;
        this.transactionInfo.fee!.token = this.chosenFeeToken;
      }

      this.checkUnlock(transferTransactions);

      this.transactionInfo.hash = this.$options.filters!.formatTxHash(transferTransactions.transaction!.txHash) as string;
      this.transactionInfo.explorerLink = APP_ZKSYNC_BLOCK_EXPLORER + "/transactions/" + this.transactionInfo.hash;
      this.transactionInfo.fee!.amount = transferTransactions.feeTransaction?.txData.tx.fee;
      this.transactionInfo.recipient = {
        address: transferTransactions.transaction!.txData.tx.to,
        name: this.chosenContact ? this.chosenContact.name : "",
      };
      this.tip = "Waiting for the transaction to be mined...";
      const receipt = await transferTransactions.transaction!.awaitReceipt();
      this.transactionInfo.success = !!receipt.success;
      await this.$accessor.wallet.requestZkBalances({ force: true });
      if (receipt.failReason) {
        throw new Error(receipt.failReason);
      }
    },
    async requestFees(force?: boolean): Promise<void> {
      if (!this.chosenFeeToken || !this.inputtedAddress || this.chosenFeeToken?.restricted) {
        this.fee = "";
        return;
      }
      this.feesLoading = true;
      try {
        const savedData = {
          address: this.inputtedAddress,
          symbol: this.chosenFeeToken?.symbol,
          feeSymbol: this.chosenFeeToken?.symbol,
          type: "MintNFT",
          force,
        };
        const requestedFee: ZkInFeesObj | undefined = await this.$accessor.wallet.requestFees(savedData);
        if (savedData.address === this.inputtedAddress && savedData.feeSymbol === this.chosenFeeToken.symbol) {
          this.fee = requestedFee!.normal!;
        }
      } catch (error) {
        this.$toast.global.zkException({
          message: error.message,
        });
        console.warn("Get fee error", error);
        this.handleFeeError();
      }
      this.feesLoading = false;
    },
    async getAccountActivationFee(): Promise<void> {
      if (!this.chosenFeeToken && !this.ownAccountUnlocked) {
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
          (this.chosenFeeToken as ZkInBalance).symbol,
        );
        this.activateAccountFee = foundFee!.totalFee.toString();
      } catch (error) {
        this.$toast.global.zkException({
          message: error.message,
        });
        console.warn("Get account activation fee error", error);
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
      this.fee = "";
      this.activateAccountFee = undefined;
    },
    checkUnlock(transferTransactions: { cpkTransaction: Transaction | null; transaction: Transaction | null; feeTransaction: Transaction | null }): void {
      if (transferTransactions.cpkTransaction) {
        this.$accessor.wallet.checkLockedState();
        transferTransactions.cpkTransaction.awaitReceipt().then(async () => {
          const newAccountState = await walletData.get().syncWallet!.getAccountState();
          walletData.set({ accountState: newAccountState });
          await this.$accessor.wallet.checkLockedState();
        });
      }
    },
    openContentHashModal() {
      return this.$accessor.openModal("ContentHash");
    },
  },
});
</script>
