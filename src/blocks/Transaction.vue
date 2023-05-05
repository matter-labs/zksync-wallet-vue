<template>
  <div class="transactionBlock">
    <block-modals-allowance />
    <block-modals-content-hash />
    <block-modals-fee-req-error />
    <block-modals-transfer-warning />
    <block-modals-destination-is-erc-20-warning :address="inputtedAddress" />
    <block-modals-withdraw-warning />
    <block-modals-fee-changed />

    <!-- Choose token -->
    <i-modal v-model="chooseTokenModalOpened" :value="chooseTokenModalOpened" size="md">
      <template #header>Choose token</template>
      <choose-token
        v-if="mainToken || chooseTokenModal === 'feeToken'"
        :fee-acceptable="chooseTokenModal === 'feeToken'"
        :only-mint-tokens="type === 'Mint'"
        :tokens-type="mainToken && chooseTokenModal !== 'feeToken' ? mainToken : 'L2-Tokens'"
        @chosen="chooseToken($event)"
      />
    </i-modal>

    <!-- Main Block -->
    <div v-if="activeTransaction && activeTransaction.step !== 'initial'">
      <block-loading-block v-if="activeTransaction.step !== 'finished'" />
      <block-success-block v-else />
    </div>
    <div v-else class="transactionTile tileBlock">
      <div class="tileHeadline withBtn h3">
        <nuxt-link :to="routeBack" class="_icon-wrapped -rounded -sm returnBtn _display-flex">
          <v-icon name="ri-arrow-left-line" scale="1" />
        </nuxt-link>
        <div>{{ transactionActionName }}</div>
      </div>

      <div v-if="isDeposit">
        <h4 class="tileSmallHeadline">
          Deposit tokens from Ethereum Wallet
          <div class="secondaryText estimatedFee _text-nowrap _displayFlex">
            <v-icon name="la-charging-station-solid" />
            <deposit-usd-fee />
          </div>
        </h4>
        <div class="secondaryText small">You can deposit tokens from your Ethereum wallet to zkSync</div>

        <template v-if="isDeposit">
          <div v-if="!isMainnet" class="_padding-0 _display-flex _justify-content-end">
            <i-button class="_padding-y-0 _margin-top-05" link to="/transaction/mint">
              Mint tokens
              <v-icon name="ri-add-fill" scale="0.75" />
            </i-button>
          </div>
        </template>
      </div>

      <template v-if="type === 'Transfer'">
        <div class="_padding-0 _display-flex _justify-content-end">
          <i-button
            class="_padding-y-0 send-link"
            data-cy="send_send_l1_button"
            link
            to="/transaction/withdraw"
            variant=""
          >
            Send to Ethereum (L1)
            <v-icon class="" name="ri-arrow-right-up-line" scale="0.75" />
          </i-button>
        </div>
      </template>

      <template v-if="displayAddressInput">
        <div :class="[isDeposit ? '_margin-top-05' : '_margin-top-1']" class="inputLabel">Address</div>
        <address-input
          ref="addressInput"
          v-model="inputtedAddress"
          :token="chosenToken ? chosenToken : undefined"
          @enter="commitTransaction()"
        />
        <block-choose-contact
          :address="inputtedAddressWithDomain"
          :display-own-address="displayOwnAddress"
          class="_margin-top-05"
          @chosen="chooseAddress($event)"
        />
      </template>

      <template v-if="displayAmountInput">
        <div class="_padding-top-1 inputLabel">Amount</div>
        <amount-input
          ref="amountInput"
          v-model="inputtedAmount"
          :max-amount="type !== 'Mint' ? maxAmount.toString() : undefined"
          :token="chosenToken ? chosenToken : undefined"
          :type="type"
          :type-name="transactionActionName"
          autofocus
          @chooseToken="chooseTokenModal = 'mainToken'"
          @enter="commitTransaction()"
        />
      </template>
      <template v-if="displayContentHashInput">
        <div class="_padding-top-1 inputLabel _display-flex _align-items-center">
          <div>Content Address</div>
          <div class="icon-container _display-flex" @click="$accessor.openModal('ContentHash')">
            <v-icon class="iconInfo" name="ri-question-mark" scale="0.9" />
          </div>
        </div>
        <hash-input
          ref="hashInput"
          v-model="contentHash"
          autofocus
          class="_margin-bottom-2"
          @enter="commitTransaction()"
        />
      </template>
      <template v-if="displayNFTTokenSelect">
        <div class="_padding-top-1 inputLabel">Token</div>
        <i-input :value="chosenToken ? `NFT-${chosenToken}` : ''" disabled size="lg" type="text">
          <template #append>
            <i-button block link variant="secondary" @click="chooseTokenModal = 'mainToken'"
              >Select{{ chosenToken ? " another " : " " }}NFT
            </i-button>
          </template>
        </i-input>
      </template>

      <!-- Allowance -->
      <div v-if="chosenToken && displayTokenUnlock">
        <div
          class="_padding-top-1 _display-flex _align-items-center inputLabel"
          @click="$accessor.openModal('Allowance')"
        >
          <span>
            <span class="tokenSymbol">{{ chosenToken }}</span> Allowance
          </span>
          <div class="iconInfo">
            <v-icon name="ri-question-mark" />
          </div>
        </div>
        <div class="grid-cols-2-layout">
          <!-- :class="{ 'single-col': singleColumnButtons }" -->
          <i-button block data-cy="approve_unlimited_button" size="md" variant="secondary" @click="unlockToken(true)">
            Approve unlimited <span class="tokenSymbol">{{ chosenToken }}</span>
          </i-button>
          <i-button
            v-if="inputtedAmount && amountBigNumber"
            key="approveAmount"
            block
            class="_margin-top-0"
            data-cy="approve_button"
            size="md"
            variant="secondary"
            @click="unlockToken(false)"
          >
            Approve {{ amountBigNumber | formatBigNumLimited(chosenToken, 7) }}
            <span class="tokenSymbol">{{ chosenToken }}</span>
          </i-button>
          <i-button v-else key="noApproveAmount" block class="_margin-top-0" disabled size="md">
            Introduce <span class="tokenSymbol">{{ chosenToken }}</span> amount
          </i-button>
        </div>
        <p class="_text-center _margin-top-05">
          <span v-if="zeroAllowance">
            You should firstly approve selected token in order to authorize deposits for
            <span class="tokenSymbol">{{ chosenToken }}</span>
          </span>
          <span v-else>
            You do not have enough allowance for <span class="tokenSymbol">{{ chosenToken }}.</span>
            <br class="desktopOnly" />
            Set higher allowance to proceed to deposit.
            <span v-if="allowance">
              <br class="desktopOnly" />Your current allowance is
              <span class="linkText" @click="setAllowanceMax()">
                {{ allowance | formatBigNumLimited(chosenToken, 7) }} <span class="tokenSymbol">{{ chosenToken }}</span>
              </span>
            </span>
          </span>
        </p>
      </div>

      <div v-if="type === 'CPK' && cpkStatus === true" class="_text-center _margin-top-1">
        Your account is already activated
      </div>

      <div v-if="error" class="errorText _text-center _margin-top-1" data-cy="transaction_error_text">{{ error }}</div>
      <div v-if="nftTokenIsntVerified" class="errorText _text-center _margin-top-1">
        Mint transaction for <span class="tokenSymbol">NFT-{{ chosenToken }}</span> isn't verified yet. <br />Try again
        once <span class="tokenSymbol">NFT-{{ chosenToken }}</span> gets verified.
      </div>

      <!-- Commit button -->
      <i-button
        :disabled="isSubmitDisabled"
        block
        class="flex-row _margin-top-1 _display-flex"
        data-cy="commit_transaction_button"
        size="lg"
        variant="secondary"
        @click="commitTransaction()"
      >
        <div class="_display-flex _justify-content-center _align-items-center">
          <v-icon v-if="!hasSigner && requireSigner" name="md-vpnkey-round" />&nbsp;&nbsp;
          <div>{{ hasSigner || !requireSigner ? "" : "Authorize to " }}{{ transactionActionName }}</div>
          <loader v-if="buttonLoader" class="_margin-left-1" size="xs" />
        </div>
      </i-button>

      <!-- Requesting signer -->
      <div v-if="requestingSigner" class="_text-center _margin-top-1" data-cy="requesting_signer_text">
        Follow the instructions in your Ethereum wallet
      </div>

      <!-- Fees -->
      <div v-if="feeSymbol && !enoughBalanceToPayFee" class="errorText _text-center _margin-top-1">
        Not enough <span class="tokenSymbol">{{ feeSymbol }}</span> to pay the fee
      </div>
      <div v-if="feeLoading" class="_text-center _margin-top-1" data-cy="fee_block_fee_message_loading">
        {{ getFeeName("txFee") }}:
        <span>
          <span class="secondaryText">Loading...</span>
        </span>
      </div>
      <template v-for="item in fees">
        <div :key="item.key" class="_text-center _margin-top-1" data-cy="fee_block_fee_message">
          {{ getFeeName(item.key) }}:
          <span
            v-if="(item.key === 'txFee' && !feeLoading) || (item.key === 'accountActivation' && !activationFeeLoading)"
          >
            {{ item.amount.toString() | parseBigNumberish(feeSymbol) }} <span class="tokenSymbol">{{ feeSymbol }}</span>
            <span class="secondaryText">
              <token-price :amount="item.amount.toString()" :symbol="feeSymbol" />
            </span>
          </span>
        </div>
      </template>
      <div v-if="activationFeeLoading" class="_text-center _margin-top-1" data-cy="fee_block_fee_message_loading">
        {{ getFeeName("accountActivation") }}:
        <span>
          <span class="secondaryText">Loading...</span>
        </span>
      </div>
      <div
        v-if="feeError"
        class="_display-flex _justify-content-center _align-items-center _padding-left-2 _margin-top-1"
      >
        <div class="errorText _text-center">
          <span>{{ feeError }}</span>
          <div class="_text-decoration-underline _cursor-pointer" @click="requestFees()">Try again</div>
        </div>
        <v-icon
          id="questionMark"
          class="iconInfo _margin-left-1"
          name="ri-question-mark"
          scale="0.9"
          @click.native="$accessor.openModal('FeeReqError')"
        />
      </div>
      <span
        v-if="requiredFees.length > 0"
        class="linkText _width-100 _display-block _text-center _margin-top-1"
        data-cy="fee_block_change_fee_token_button"
        @click="showChangeFeeTokenModal"
      >
        Change fee token
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { RawLocation } from "vue-router/types";
import { BigNumber } from "@ethersproject/bignumber";
import { Address, TokenLike, Tokens, TokenSymbol } from "zksync/build/types";
import {
  ZkActiveTransaction,
  ZkCPKStatus,
  ZkFee,
  ZkFeeType,
  ZkTransactionMainToken,
  ZkTransactionType,
} from "@matterlabs/zksync-nuxt-core/types";
import { getAddress } from "@ethersproject/address";
import { RestProvider } from "zksync";
import { warningCanceledKey } from "@/blocks/modals/TransferWarning.vue";
import { DO_NOT_SHOW_WITHDRAW_WARNING_KEY } from "@/blocks/modals/WithdrawWarning.vue";

const feeNameDict = new Map([
  ["txFee", "Fee"],
  ["accountActivation", "Account Activation single-time fee"],
]);

export default Vue.extend({
  data() {
    return {
      inputtedAmount: this.$store.getters["zk-transaction/amount"],
      inputtedAddress: this.$store.getters["zk-transaction/address"],
      chooseTokenModal: false as false | "mainToken" | "feeToken",
      contentHash: this.$store.getters["zk-transaction/contentHash"],
      loading: true,
      requestingSigner: false,
    };
  },
  computed: {
    isMainnet(): boolean {
      return this.$store.getters["zk-provider/network"] === "mainnet";
    },
    isSubmitDisabled(): boolean {
      return (!this.commitAllowed && (this.hasSigner || !this.requireSigner)) || this.requestingSigner || this.loading;
    },
    buttonLoader(): boolean {
      return (
        this.allowanceLoading || (!this.nftExists && this.nftExistsLoading) || this.loading || this.requestingSigner
      );
    },
    nftTokenIsntVerified(): boolean {
      return Boolean(this.chosenToken && this.mainToken === "L2-NFT" && !this.nftExists && !this.nftExistsLoading);
    },
    routeBack(): RawLocation {
      if (
        this.fromRoute &&
        this.fromRoute.fullPath !== this.$route.fullPath &&
        this.fromRoute.path !== "/transaction/withdraw"
      ) {
        return { path: this.fromRoute.path, query: this.fromRoute.query, params: this.fromRoute.params };
      }
      if (this.mainToken === "L2-NFT" || this.type === "MintNFT") {
        return "/account/nft";
      } else if (this.type === "Deposit") {
        return "/account/top-up";
      }
      return "/account";
    },
    type(): ZkTransactionType {
      return this.$store.getters["zk-transaction/type"];
    },
    transactionActionName(): string | undefined {
      return this.$store.getters["zk-transaction/transactionActionName"];
    },
    mainToken(): ZkTransactionMainToken {
      return this.$store.getters["zk-transaction/mainToken"];
    },
    chosenToken(): TokenLike | undefined {
      return this.$store.getters["zk-transaction/symbol"];
    },
    feeSymbol(): TokenSymbol | undefined {
      return this.$store.getters["zk-transaction/feeSymbol"];
    },
    enoughBalanceToPayFee(): boolean {
      return this.$store.getters["zk-transaction/enoughBalanceToPayFee"];
    },
    displayAddressInput(): boolean {
      return this.type !== "CPK";
    },
    displayAmountInput(): boolean {
      switch (this.type) {
        case "Deposit":
        case "Mint":
        case "Transfer":
        case "Withdraw":
          return true;

        default:
          return false;
      }
    },
    displayContentHashInput(): boolean {
      return this.type === "MintNFT";
    },
    displayNFTTokenSelect(): boolean {
      switch (this.type) {
        case "TransferNFT":
        case "WithdrawNFT":
          return true;

        default:
          return false;
      }
    },
    nftExists(): boolean {
      return this.$store.getters["zk-transaction/nftExists"];
    },
    nftExistsLoading(): boolean {
      return this.$store.getters["zk-transaction/nftExistsLoading"];
    },
    commitAllowed(): boolean {
      return this.$store.getters["zk-transaction/commitAllowed"];
    },
    error(): Error {
      return this.$store.getters["zk-transaction/error"];
    },
    feeError(): Error {
      return this.$store.getters["zk-transaction/feeError"];
    },
    amountBigNumber(): BigNumber | undefined {
      return this.$store.getters["zk-transaction/amountBigNumber"];
    },
    zeroAllowance(): boolean {
      if (!this.chosenToken) {
        return false;
      }
      this.$store.getters["zk-balances/tokensAllowanceForceUpdate"];
      const tokenAllowance: BigNumber | undefined = this.$store.getters["zk-balances/tokenAllowance"](this.chosenToken);
      if (!tokenAllowance) {
        return false;
      }
      return tokenAllowance.eq("0");
    },
    maxAmount(): BigNumber {
      return this.$store.getters["zk-transaction/maxAmount"];
    },
    allowance(): BigNumber | undefined {
      this.$store.getters["zk-balances/tokensAllowanceForceUpdate"];
      return this.$store.getters["zk-balances/tokenAllowance"](this.chosenToken);
    },
    enoughAllowance(): boolean {
      return this.$store.getters["zk-transaction/enoughAllowance"];
    },
    allowanceLoading(): boolean {
      this.$store.getters["zk-balances/tokensAllowanceForceUpdate"];
      if (this.type === "Deposit" && this.chosenToken !== undefined) {
        return !!this.$store.getters["zk-balances/tokensAllowanceLoading"][this.chosenToken];
      }
      return false;
    },
    displayTokenUnlock(): boolean {
      return (
        this.type === "Deposit" &&
        this.chosenToken !== undefined &&
        (!this.enoughAllowance || this.zeroAllowance) &&
        (!this.allowanceLoading || this.zeroAllowance)
      );
    },
    displayOwnAddress(): boolean {
      return ["Deposit", "Withdraw", "Mint", "WithdrawNFT", "MintNFT"].includes(this.type);
    },
    activeTransaction(): ZkActiveTransaction {
      return this.$store.getters["zk-transaction/activeTransaction"];
    },
    fees(): ZkFee[] {
      return this.$store.getters["zk-transaction/fees"];
    },
    requiredFees(): ZkFeeType[] {
      return this.$store.getters["zk-transaction/requiredFees"];
    },
    hasSigner(): boolean {
      return this.$store.getters["zk-wallet/hasSigner"];
    },
    requireSigner(): boolean {
      return this.mainToken === "L2-Tokens" || this.mainToken === "L2-NFT" || this.type === "MintNFT";
    },
    feeLoading(): boolean {
      return this.$store.getters["zk-transaction/feeLoading"];
    },
    activationFeeLoading(): boolean {
      return this.$store.getters["zk-transaction/activationFeeLoading"];
    },
    isDeposit(): boolean {
      return this.type === "Deposit";
    },
    chooseTokenModalOpened: {
      get(): boolean {
        return this.chooseTokenModal !== false;
      },
      set(value) {
        if (!value) {
          this.chooseTokenModal = false;
        }
      },
    },
    cpkStatus(): ZkCPKStatus {
      return this.$store.getters["zk-wallet/cpk"];
    },
    inputtedAddressWithDomain(): string {
      const domainAddress = this.$store.getters["uns/getDomain"](this.inputtedAddress, this.chosenToken);
      return domainAddress || this.inputtedAddress;
    },
  },
  watch: {
    inputtedAmount: {
      immediate: true,
      handler(val, oldVal) {
        if (oldVal === undefined) {
          this.$nextTick(() => {
            this.$store.commit("zk-transaction/setAmount", val);
          });
        } else {
          this.$store.commit("zk-transaction/setAmount", val);
        }
      },
    },
    inputtedAddressWithDomain(val) {
      const domainAddress = this.$store.getters["uns/getDomain"](val, this.chosenToken);
      this.$store.dispatch("zk-transaction/setAddress", domainAddress || val);
    },
    contentHash(val) {
      this.$store.commit("zk-transaction/setContentHash", val);
    },
  },
  async mounted() {
    if (!this.$store.getters["zk-account/loggedIn"]) {
      return;
    }
    if (!this.$store.getters["zk-account/accountStateRequested"]) {
      await this.$store.dispatch("zk-account/updateAccountState");
    }
    this.checkCPK();
    if (this.$route.query.token) {
      if (this.mainToken === "L2-NFT") {
        this.chooseToken(parseInt(this.$route.query.token.toString()));
      } else {
        this.chooseToken(this.$route.query.token.toString());
      }
    }
    if (this.$route.query.address) {
      this.inputtedAddress = this.$route.query.address;
    }
    this.loading = false;
  },
  beforeDestroy() {
    this.$store.commit("zk-transaction/setAmount", undefined);
    this.$store.commit("zk-transaction/setContentHash", undefined);
  },
  methods: {
    chooseToken(token: TokenLike) {
      if (!this.chooseTokenModal || this.chooseTokenModal === "mainToken") {
        this.$store.dispatch("zk-transaction/setSymbol", token);
      } else if (this.chooseTokenModal === "feeToken") {
        this.$store.dispatch("zk-transaction/setFeeSymbol", token);
        this.$analytics.track("change_fee_token");
      }
      this.chooseTokenModal = false;
    },
    async checkWithdraw(): Promise<boolean> {
      const doNotShowWarning = localStorage.getItem(DO_NOT_SHOW_WITHDRAW_WARNING_KEY);

      if (doNotShowWarning) {
        return true;
      }

      const result = await this.$accessor.openDialog("WithdrawWarning");
      return !!result;
    },
    async checkTransfer(): Promise<boolean> {
      const transferWithdrawWarning = localStorage.getItem(warningCanceledKey);

      if (
        transferWithdrawWarning ||
        getAddress(this.inputtedAddressWithDomain) === this.$store.getters["zk-account/address"]
      ) {
        return true;
      }

      const accountUnlocked = await this.checkInputtedAccountUnlocked();
      if (accountUnlocked) {
        return true;
      }

      const result = await this.$accessor.openDialog("TransferWarning");
      return !!result;
    },
    async checkIfDestinationIsERC20Address(): Promise<boolean> {
      const tokens: Tokens = this.$store.getters["zk-tokens/zkTokens"];
      if (!this.inputtedAddress || !tokens) {
        return true;
      }
      const tokensAddresses = Object.entries(tokens).map(([_, token]) => token.address.toLowerCase());
      if (tokensAddresses.includes(this.inputtedAddress?.toLowerCase())) {
        const result = await this.$accessor.openDialog("DestinationIsERC20Warning");
        return !!result;
      }
      return true;
    },
    async commitTransaction() {
      if (!this.hasSigner && this.requireSigner) {
        try {
          this.requestingSigner = true;
          await this.$store.dispatch("zk-wallet/requestSigner");
          this.checkCPK();
          this.$analytics.track("request_signer");
        } catch (err) {
          this.$analytics.track("request_signer_fail");
          this.$sentry.captureException(err, { tags: { "operation.type": "requestSigner" } });
        }
        this.requestingSigner = false;
      } else {
        if (!this.commitAllowed || this.loading) {
          return;
        }

        /* Transfer != Withdraw warning */
        try {
          this.loading = true;

          if (this.type === "Withdraw") {
            if (!(await this.checkWithdraw())) {
              return;
            }
          }
          if (this.type === "Transfer" || this.type === "TransferNFT") {
            if (!(await this.checkTransfer())) {
              return;
            }
          }

          if (!(await this.checkIfDestinationIsERC20Address())) {
            return;
          }

          const result = await this.$store.dispatch("zk-transaction/commitTransaction", { requestFees: true });

          this.trackTransaction(!result);
        } catch (error) {
          this.$sentry.captureException(error, { tags: { "operation.type": this.type } });
          this.$store.commit("zk-transaction/setError", error);
          this.trackTransaction(true);
        } finally {
          this.loading = false;
          if (this.$store.getters["zk-transaction/error"]) {
            this.checkCPK();
          }
        }
      }
    },
    trackTransaction(failed = false): void {
      const status = failed ? "_fail" : "";
      switch (this.type) {
        case "Deposit":
          this.$analytics.track("deposit" + status, {
            amount: this.inputtedAmount,
            opToken: this.chosenToken,
          });
          break;
        case "Mint":
          this.$analytics.track("mint" + status, {
            amount: this.inputtedAmount,
            opToken: this.chosenToken,
          });
          break;
        case "MintNFT":
          this.$analytics.track("mint_nft" + status, {
            feeToken: this.feeSymbol,
          });
          break;
        case "TransferNFT":
          this.$analytics.track("transfer_nft" + status, {
            feeToken: this.feeSymbol,
          });
          break;
        case "WithdrawNFT":
          this.$analytics.track("withdraw_nft" + status, {
            feeToken: this.feeSymbol,
          });
          break;
        case "Transfer":
          this.$analytics.track("transfer" + status, {
            amount: this.inputtedAmount,
            opToken: this.chosenToken,
            feeToken: this.feeSymbol,
          });
          break;
        case "Withdraw":
          this.$analytics.track(
            (getAddress(this.inputtedAddressWithDomain) === this.$store.getters["zk-account/address"]
              ? "l1_withdraw"
              : "l1_transfer") + status,
            {
              amount: this.inputtedAmount,
              opToken: this.chosenToken,
              feeToken: this.feeSymbol,
            }
          );
          break;
        default:
          this.$analytics.track(this.type + status);
          break;
      }
    },
    async checkInputtedAccountUnlocked(): Promise<boolean> {
      const syncProvider: RestProvider = await this.$store.dispatch("zk-provider/requestProvider");
      const state = await syncProvider.getState(this.inputtedAddressWithDomain);
      return state.id != null;
    },
    async unlockToken(unlimited = false) {
      await this.$store.dispatch("zk-transaction/setAllowance", unlimited);
    },
    chooseAddress(address: Address) {
      this.inputtedAddress = address;
    },
    setAllowanceMax() {
      this.inputtedAmount = this.$options.filters!.parseBigNumberish(this.allowance, this.chosenToken);
    },
    getFeeName(key: string): string | undefined {
      return feeNameDict!.has(key) ? feeNameDict.get(key) : "";
    },
    async requestFees() {
      await this.$store.dispatch("zk-transaction/requestAllFees", true);
    },
    checkCPK() {
      if (this.mainToken !== "L1-Tokens" && this.$store.getters["zk-wallet/cpk"] !== true && this.type !== "CPK") {
        if (this.$store.getters["zk-wallet/cpk"] === false) {
          this.$accessor.openModal("SignPubkey");
        }
        if (!this.$store.getters["zk-transaction/accountActivationFee"]) {
          this.$store.dispatch("zk-transaction/requestAccountActivationFee");
        }
      }
    },
    showChangeFeeTokenModal() {
      this.chooseTokenModal = "feeToken";
      this.$analytics.track("visit_change_fee_token");
    },
  },
});
</script>

<style lang="scss">
.dappPageWrapper {
  .estimatedFee {
    margin: 3px 0;
  }

  .orDivider {
    width: 100%;
    height: max-content;
    display: grid;
    grid-template-columns: 1fr max-content 1fr;
    grid-template-rows: 100%;
    grid-gap: 17px;
    align-items: center;
    padding: 23px 0;

    .line {
      width: 100%;
      height: 1px;
      background-color: #eeeeee;
      transition: background-color $transition1;
      will-change: background-color;
    }

    .orText {
      font-size: 18px;
      font-weight: 700;
      color: #eeeeee;
      text-align: center;
      transition: color $transition1;
      will-change: color;
    }
  }
}

.inkline.-dark {
  .dappPageWrapper {
    .tileSmallHeadline {
      color: $white;
    }

    .orDivider {
      .line {
        background-color: transparentize($color: $gray, $amount: 0.5);
      }

      .orText {
        color: transparentize($color: $gray, $amount: 0.3);
      }
    }
  }
}

h4.tileSmallHeadline {
  font-weight: 700;
  font-size: 16px;
  line-height: 22px;
  margin: 0 0 1rem;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;

  & > * {
    display: flex;
    flex-flow: nowrap row;
    justify-content: space-between;
    align-items: flex-start;
  }
}
</style>
