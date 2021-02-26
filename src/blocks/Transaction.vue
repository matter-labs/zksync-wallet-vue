<template>
  <div class="transactionPage">
    <i-modal v-model="saveContactModal" class="prevent-close" size="md">
      <template slot="header">Save contact</template>
      <div>
        <div class="_padding-bottom-1">Contact name</div>
        <i-input v-model="saveContactInput" size="lg" placeholder="Name" maxlength="20" @keyup.enter="saveContact()" />
        <div v-if="saveContactModalError" class="modalError _margin-top-1">{{ saveContactModalError }}</div>
        <i-button class="_margin-top-1" block variant="secondary" size="lg" @click="saveContact()">Save</i-button>
      </div>
    </i-modal>

    <i-modal v-model="transferWithdrawWarningDialog" class="prevent-close" size="md">
      <template slot="header">Transfer warning</template>
      <div>
        <div class="_padding-bottom-1">
          You are about to transfer money to an address that doesn't have a zkSync balance yet. The transfer will happen inside zkSync L2. If you want to move money from zkSync to
          the mainnet, please use the
          <nuxt-link :to="`/withdraw?w=${inputAddress}`">Withdraw</nuxt-link>
          function instead.
        </div>
        <i-checkbox v-model="transferWithdrawWarningCheckmark">Do not show this again</i-checkbox>
        <i-button class="_margin-top-1" block variant="secondary" size="lg" @click="warningDialogProceedTransfer()">Transfer inside zkSync</i-button>
      </div>
    </i-modal>

    <div v-if="success === true" class="tileBlock">
      <div class="tileHeadline h3">
        <span>{{ isWithdrawal ? "Withdraw" : "Transfer" }}</span>
      </div>
      <checkmark />
      <p class="_text-center _margin-top-0">Your {{ isWithdrawal ? "withdrawal" : "transaction" }} will be processed shortly. Use the transaction link to track the progress.</p>
      <a class="_display-block _text-center _margin-top-1" target="_blank" :href="`${blockExplorerLink}/transactions/${transactionHash}`">
        Link to the transaction&nbsp;<i class="fas fa-external-link"></i>
      </a>
      <div class="totalAmount smaller _margin-top-2">
        <div class="amount">
          <span>Recipient:</span>
          <span v-if="isOwnAddress" class="totalPrice">Own account</span>
          <span v-else-if="chosenContract" class="totalPrice">{{ chosenContract.name }}</span>
        </div>
        <wallet-address :wallet="inputAddress" />
      </div>
      <div class="totalAmount _margin-top-1">
        <div class="headline">Amount:</div>
        <div class="amount">
          <span class="tokenSymbol">{{ chosenToken.symbol }}</span>
          {{ transactionAmount | formatToken(chosenToken.symbol) }}
          <span class="totalPrice">
            {{ transactionAmount | formatUsdAmount(chosenToken.tokenPrice, chosenToken.symbol) }}
          </span>
        </div>
      </div>
      <div class="totalAmount smaller _margin-top-1">
        <div class="headline">Fee:</div>
        <div class="amount">
          <span class="tokenSymbol">{{ getRealFeeToken.symbol }}</span>
          {{ transactionFee | formatToken(getRealFeeToken.symbol) }}
          <span class="totalPrice">
            {{ transactionFee | formatUsdAmount(getRealFeeToken.tokenPrice, getRealFeeToken.symbol) }}
          </span>
        </div>
      </div>
      <i-button block size="lg" variant="secondary" class="_margin-top-2" to="/account">Ok</i-button>
    </div>

    <div v-else-if="mainLoading === true" class="tileBlock">
      <div class="tileHeadline h3">{{ isWithdrawal ? "Withdraw" : "Transfer" }}</div>
      <a v-if="transactionHash" class="_display-block _text-center" target="_blank" :href="`${blockExplorerLink}/transactions/${transactionHash}`">
        Link to the transaction&nbsp;<i class="fas fa-external-link" />
      </a>
      <p v-if="tip" class="_display-block _text-center _margin-top-1">{{ tip }}</p>
      <div v-if="mainLoading === true" class="nothingFound _padding-y-2">
        <loader />
      </div>
    </div>

    <div v-else class="tileBlock">
      <div class="tileHeadline withBtn h3">
        <nuxt-link :to="fromRoute && fromRoute.fullPath !== $route.fullPath ? fromRoute : '/account'" class="returnBtn">
          <i class="far fa-long-arrow-alt-left"></i>
        </nuxt-link>
        <div>
          {{ isWithdrawal ? "Withdraw" : "Transfer" }}
        </div>
      </div>

      <div class="_padding-bottom-1">Address</div>

      <i-input v-model="inputAddress" autocomplete="none" size="lg" placeholder="0x address" type="text" maxlength="42" @keyup.enter="commitTransaction()" />

      <i-row class="_margin-top-1">
        <i-column v-if="!chosenContract && !isOwnAddress" xs="12" :md="canSaveContact ? 7 : 12">
          <i-button block link variant="secondary" @click="contactsListModal = true">Select from contacts</i-button>
        </i-column>
        <i-column v-else xs="12" :md="canSaveContact ? 7 : 12">
          <i-button block link variant="secondary" @click="contactsListModal = true">
            {{ isOwnAddress ? "Own account" : chosenContract.name }}&nbsp;&nbsp;<i class="far fa-angle-down" />
          </i-button>
        </i-column>
        <i-column xs="12" md="5">
          <i-button v-if="canSaveContact" block link variant="secondary" @click="saveContactModal = true"> Save to contacts</i-button>
        </i-column>
      </i-row>
      <br />
      <div class="_padding-bottom-1">Amount / asset</div>
      <div>
        <i-input v-model="inputTotalSum" size="lg" :precision="decimalPrecision" type="text" @keyup.enter="commitTransaction()">
          <i-button v-if="!chosenToken" slot="append" block link variant="secondary" @click="openTokenList()"> Select token</i-button>
          <i-button v-else slot="append" block class="selectedTokenBtn" link variant="secondary" @click="openTokenList()">
            <span class="tokenSymbol">{{ chosenToken.symbol }}</span
            >&nbsp;&nbsp;<i class="far fa-angle-down" />
          </i-button>
        </i-input>
      </div>
      <div v-if="chosenToken" class="_display-flex _justify-content-space-between _margin-top-1">
        <div class="totalPrice">
          {{ inputTotalSumBigNumber | formatUsdAmount(chosenToken.tokenPrice, chosenToken.symbol) }}
        </div>
        <div class="maxAmount" @click="chooseMaxAmount()">Max: {{ transactionMaxAmount | formatToken(chosenToken.symbol) }}</div>
      </div>

      <!-- <i-radio-group v-if="chosenToken && isWithdrawal && (!chosenFeeToken || chosenFeeToken.symbol===chosenToken.symbol) && feesObj" v-model="fastWithdraw"
                     class="_margin-top-2">
        <i-radio :value="false">
          Normal withdraw (
          <strong>Fee:</strong>
          <span v-if="feesObj && feesObj['normal']">
            {{ feesObj && feesObj["normal"] | formatToken(getRealFeeToken.symbol) }}
            <span class="tokenSymbol">
              {{ getRealFeeToken.symbol }}
            </span>
            <span class="totalPrice">
              {{ feesObj["normal"] | formatUsdAmount(getRealFeeToken.tokenPrice, getRealFeeToken.symbol) }}
            </span>
          </span>
          <span v-else class="totalPrice">Loading...</span>
          ).
          <br>
          Processing time: {{ withdrawTime.normal | getTimeString }}
        </i-radio>
        <i-radio :value="true">
          Fast withdraw (
          <strong>Fee:</strong>
          <span v-if="feesObj && feesObj['fast']">
            {{ feesObj && feesObj["fast"] | formatToken(getRealFeeToken.symbol) }}
            <span class="tokenSymbol">{{ getRealFeeToken.symbol }}</span>
            <span class="totalPrice">
              {{ feesObj["fast"] | formatUsdAmount(getRealFeeToken.tokenPrice, getRealFeeToken.symbol) }}
            </span>
          </span>
          <span v-else class="totalPrice">Loading...</span>

          ).<br />
          Processing time: {{ withdrawTime.fast | getTimeString }}
        </i-radio>
      </i-radio-group>

      <div v-else-if="chosenToken && isWithdrawal && feesObj" class="totalPrice _text-center _margin-top-1">
        Only normal withdraw ({{ withdrawTime.normal | getTimeString }}) is available when using different fee token
      </div> -->

      <div v-if="displayedError" class="errorText _text-center _margin-top-1">{{ displayedError }}</div>

      <i-button block size="lg" variant="secondary" class="_margin-top-1" :disabled="isTransferBlocked" @click="commitTransaction()">
        <i v-if="isWithdrawal" class="fas fa-hand-holding-usd"></i>
        <i v-else class="fas fa-paper-plane"></i>
        {{ isWithdrawal ? "Withdraw" : "Transfer" }}
      </i-button>
      <div v-if="cantFindFeeToken === true && feesObj && chosenToken && hasValidAddress" class="errorText _text-center _margin-top-1">
        <span class="tokenSymbol">{{ chosenToken.symbol }}</span> is not suitable for paying fees<br />
        No available tokens on your balance to pay the fee
      </div>
      <div v-else-if="(feesObj || feesObj[fastWithdraw ? 'fast' : 'normal'] || feesLoading) && chosenToken && hasValidAddress" class="_text-center _margin-top-1">
        Fee:
        <span v-if="feesLoading" class="totalPrice">Loading...</span>
        <span v-else>
          {{ feesObj[fastWithdraw === true ? "fast" : "normal"] | formatToken(getRealFeeToken.symbol) }} <span class="tokenSymbol">{{ getRealFeeToken.symbol }}</span>
          <span class="totalPrice">
            {{ feesObj[fastWithdraw === true ? "fast" : "normal"] | formatUsdAmount(getRealFeeToken.tokenPrice, getRealFeeToken.symbol) }}
          </span>
          <span class="chooseFeeToken" @click="chooseFeeTokenModal = true">Choose fee token</span>
        </span>

        <div v-if="isWithdrawal && withdrawTime && withdrawTime.normal" class="totalPrice">
          <i-tooltip>
            <div class="_display-inline-flex">
              Estimated processing time: {{ withdrawTime.normal | getTimeString }}
              <i class="fas fa-question withdrawalAnnounce" />
            </div>
            <template slot="body">Despite all the capabilities of ZK and L2, full withdrawal process may take up to 5 hours and depends on L1</template>
          </i-tooltip>
        </div>
      </div>
    </div>

    <i-modal v-model="tokenListModal" size="md">
      <template slot="header">Balances in L2</template>
      <choose-fee-token
        v-model="tokenListModal"
        :show-restricted="true"
        :show-zero-balance="true"
        :show-cant-find-token="true"
        @selectToken="tokenListModal = false"
        @input="chooseToken"
      />
    </i-modal>

    <i-modal v-model="contactsListModal" size="md">
      <template slot="header">Contacts</template>
      <div>
        <i-input v-if="contactSearch.trim() || displayedContactsList.length !== 0" v-model="contactSearch" placeholder="Filter contacts" maxlength="20">
          <i slot="prefix" class="far fa-search"></i>
        </i-input>
        <div class="contactsListContainer">
          <div v-if="!contactSearch.trim() && displayedContactsList.length === 0 && type !== 'withdraw'" class="nothingFound">
            <span>The contact list is empty</span>
          </div>
          <div v-else-if="contactSearch.trim() && displayedContactsList.length === 0" class="nothingFound">
            <span
              >Your search <b>"{{ contactSearch }}"</b> did not match any contacts</span
            >
          </div>
          <template v-else>
            <div v-if="!contactSearch.trim() && type === 'withdraw'" class="contactItem" @click.self="chooseContact({ name: 'Own account', address: ownAddress })">
              <user-img :wallet="ownAddress" />
              <div class="contactInfo">
                <div class="contactName">Own account</div>
                <div class="contactAddress walletAddress">{{ ownAddress }}</div>
              </div>
            </div>
            <div v-for="(item, index) in displayedContactsList" :key="index" class="contactItem" @click.self="chooseContact(item)">
              <user-img :wallet="item.address" />
              <div class="contactInfo">
                <div class="contactName">{{ item.name }}</div>
                <div class="contactAddress walletAddress">{{ item.address }}</div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </i-modal>

    <i-modal v-model="chooseFeeTokenModal" size="md">
      <template slot="header">Choose fee token</template>
      <choose-fee-token v-model="chosenFeeToken" @selectToken="chooseFeeTokenModal = false" />
    </i-modal>
  </div>
</template>

<script>
import Checkmark from "@/components/Checkmark.vue";
import userImg from "@/components/userImg.vue";
import walletAddress from "@/components/walletAddress.vue";
import { APP_ZKSYNC_BLOCK_EXPLORER } from "@/plugins/build";
import utils from "@/plugins/utils.js";
import validations from "@/plugins/validations.js";

import { transaction, withdraw } from "@/plugins/walletActions/transaction.js";
import { walletData } from "@/plugins/walletData.js";
import ChooseFeeToken from "~/blocks/ChooseFeeToken.vue";

export default {
  components: {
    userImg,
    Checkmark,
    walletAddress,
    ChooseFeeToken,
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
      decimalPrecision: 18,
      calculatedFees: null,

      zksync: null,
      contactsListModal: false,
      tokenListModal: false,
      chooseFeeTokenModal: false,
      hasValidAmount: false,

      transferWithdrawWarningDialog: false,
      transferWithdrawWarningCheckmark: false,

      mainLoading: true,
      withdrawTime: false,
      feesObj: {},
      feesLoading: false,

      inputTotalSum: null,
      inputTotalSumBigNumber: null,

      // @todo: Refactor this into a store-based solution
      //
      // NOTE: This is temporary solution.
      // In the future, all the error handling should be centralized
      // in the storage. As for now all the functions manipulate a single
      // variable: `mainError`.
      //
      // It is very good for design purposes, but is really
      // bad since one type of error might want to set mainError as "", while the other
      // one might want to set a non-nullish value that should be displayed to the user.
      //
      // `digitsError` and `packingError` were a temporary solution to cope that problem
      // with error of user entering too many digits, and un-packable amount error.
      mainError: "",
      digitsError: "",
      packingError: "",
      inputAddress: this.type === "withdraw" ? walletData.get().syncWallet.address() : "",
      fastWithdraw: false,

      contactSearch: "",
      contactsList: [],
      chosenContract: false,
      saveContactInput: "",
      saveContactModalError: "",
      saveContactModal: false,

      tokenSearch: "",
      tokensList: [],
      chosenToken: false,
      cantFindTokenModal: false,

      chosenFeeToken: false,
      cantFindFeeToken: false,

      tip: "",
      success: false,
      transactionHash: "",
      transactionAmount: null,
      transactionFee: null,
    };
  },
  computed: {
    /**
     * Unified fee token return
     * @return Object
     */
    isWithdrawal() {
      return this.type === "withdraw";
    },
    displayedError() {
      return this.mainError || this.digitsError || this.packingError;
    },
    hasBlockEnforced() {
      return (
        !this.inputTotalSumBigNumber ||
        !this.feesObj ||
        !this.getRealFeeToken ||
        !this.inputTotalSumBigNumber ||
        !this.inputTotalSum ||
        !parseFloat(this.inputTotalSum) ||
        !this.chosenToken
      );
    },
    getRealFeeToken() {
      return this.chosenFeeToken ? this.chosenFeeToken : this.chosenToken;
    },
    canSaveContact() {
      let isInContactList = false;
      for (const item of this.contactsList) {
        if (item.address === this.inputAddress) {
          this.setContact(item);
          isInContactList = true;
          break;
        }
      }
      if (!isInContactList) {
        this.setContact();
      }
      return !isInContactList && !this.isOwnAddress && !this.chosenContract && this.hasValidAddress;
    },
    isAccountLocked() {
      return this.$store.getters["wallet/isAccountLocked"];
    },
    displayedContactsList() {
      if (!this.contactSearch.trim()) {
        return this.contactsList;
      }
      return this.contactsList.filter((e) => e.name.toLowerCase().includes(this.contactSearch.trim().toLowerCase()));
    },

    /**
     *
     * @return boolean
     */
    hasValidAddress() {
      return this.inputAddress && validations.eth.test(this.inputAddress);
    },
    isTransferBlocked() {
      return !this.hasValidAddress || !this.hasValidAmount || !this.chosenToken || !!this.hasErrors || !!this.hasBlockEnforced;
    },
    isOwnAddress() {
      return this.inputAddress.toLowerCase() === walletData.get().syncWallet.address().toLowerCase();
    },
    ownAddress() {
      return walletData.get().syncWallet.address();
    },
    enoughTokenFee() {
      if (!this.feesObj || !this.getRealFeeToken || !this.inputTotalSumBigNumber) {
        this.setMainError(``);
        return false;
      }
      const feeAmount = this.fastWithdraw === true ? this.feesObj.fast : this.feesObj.normal;
      if (feeAmount.lte(0)) {
        this.setMainError(`Fee requires recalculation. Reload the page and try again.`);
        return false;
      }

      if (this.getRealFeeToken && this.getRealFeeToken.rawBalance.lt && this.getRealFeeToken.rawBalance.lt(feeAmount)) {
        this.setMainError(`Not enough ${this.getRealFeeToken.symbol} to pay the fee`);
        return false;
      }
      this.setMainError("");
      return true;
    },
    blockExplorerLink() {
      return APP_ZKSYNC_BLOCK_EXPLORER;
    },
    hasErrors() {
      if (!this.chosenToken || !this.decimalPrecision) {
        return false;
      }
      try {
        let noErrors = true;
        if (this.chosenFeeToken) {
          if (!utils.isDecimalsValid(this.chosenToken.symbol, this.chosenFeeToken.balance, this.decimalPrecision)) {
            this.pushDigitsErrorValue(`Amount out of range, ${this.chosenToken.symbol} doesn't allows that much decimal digits`);
            return;
          }
        }
        if (!this.transactionMaxAmount || !this.enoughTokenFee) {
          noErrors = false;
        }
        return !noErrors;
      } catch {
        return true;
      }
    },
    transactionMaxAmount() {
      if (!this.chosenToken) {
        return 0;
      }

      const bigNumBalance = utils.parseToken(this.chosenToken.symbol, this.chosenToken.balance);
      if (bigNumBalance.lte(0)) {
        return 0;
      }

      let closestPackableInput = bigNumBalance;
      if ((!this.chosenFeeToken || this.chosenFeeToken.symbol === this.chosenToken.symbol) && this.hasValidAddress && !this.cantFindFeeToken) {
        const amountToParse = this.fastWithdraw === true ? this.feesObj.fast : this.feesObj.normal;
        if (amountToParse === undefined) {
          return 0;
        }
        const maxAmount = bigNumBalance.sub(amountToParse);
        if (maxAmount.lte(0)) {
          this.setMainError(`You don't have enough ${this.chosenToken.symbol}`);
          return 0;
        }
        closestPackableInput = maxAmount;
      }
      const realMaxAmount = this.zksync.closestPackableTransactionAmount(closestPackableInput);

      if (!this.inputTotalSumBigNumber) {
        this.setMainError("");
      } else if (realMaxAmount.lt(this.inputTotalSumBigNumber)) {
        this.setMainError(`You don't have enough ${this.chosenToken.symbol}`);
      } else {
        this.setMainError("");
      }

      return realMaxAmount;
    },
  },
  watch: {
    fastWithdraw() {
      this.validateAmount(this.inputTotalSum);
    },
    hasBlockEnforced() {
      // console.log("block enforced changed: ", val);
    },
    inputAddress() {
      if (this.hasValidAddress) {
        this.getFees();
      }
    },
    inputTotalSum(val) {
      this.validateAmount(val);
    },
    chosenToken: {
      deep: true,
      async handler(val) {
        if (this.isWithdrawal && val && this.chosenFeeToken && val.symbol !== this.chosenFeeToken.symbol) {
          this.fastWithdraw = false;
        }
        await this.updateDecimals();
        this.checkForFeeToken();
        this.validateAmount(this.inputTotalSum);
      },
    },
    chosenFeeToken: {
      deep: true,
      async handler(val) {
        if (this.isWithdrawal && val && val.symbol !== this.chosenToken.symbol) {
          this.fastWithdraw = false;
        }
        await this.getFees();
        this.validateAmount(this.inputTotalSum);
      },
    },
  },
  async mounted() {
    this.zksync = await walletData.zkSync();
    if (this.$route.query.w) {
      this.inputAddress = this.$route.query.w;
    }
    if (this.$route.query.token) {
      this.mainLoading = true;
      /**
       * @type {Array}
       */
      const list = await this.$store.dispatch("wallet/getzkBalances");
      this.tokensList = list.map((e) => ({ ...e, balance: e.balance }));
      const tokenLoaded = this.tokensList.filter((singleTokenObj) => singleTokenObj.symbol === this.$route.query.token).shift();
      await this.chooseToken(tokenLoaded);
      this.mainLoading = false;
    }
    this.getContactsList();
    if (this.isWithdrawal) {
      await this.getWithdrawalTime();
    } else {
      this.mainLoading = false;
    }
    await this.updateDecimals();
  },
  methods: {
    /**
     * Storing centralized way any error with the digits
     * @param errorText
     */
    pushDigitsErrorValue(errorText = null) {
      this.digitsError = errorText;
    },
    chooseMaxAmount() {
      this.inputTotalSum = utils.handleFormatToken(this.chosenToken.symbol, this.transactionMaxAmount);
    },
    async updateDecimals() {
      const decimals = await this.$store.dispatch("tokens/getTokenDecimals", this.chosenToken.symbol);
      this.decimalPrecision = this.chosenToken && decimals ? decimals : 18;
    },
    handleFeeObjectProcessing() {
      if (!this.calculatedFees) {
        return "";
      }
      const calculatedFee = this.calculatedFees[this.fastWithdraw === true ? "fast" : "normal"];
      if (!calculatedFee) {
        return "";
      }
      return calculatedFee;
    },
    setMainError(errorMessage) {
      this.mainError = errorMessage;
    },
    setContact(item = false) {
      this.chosenContract = item;
    },
    async openTokenList() {
      this.mainLoading = true;
      try {
        const list = await this.$store.dispatch("wallet/getzkBalances");
        this.tokensList = list.map((e) => ({ ...e, balance: e.balance }));
        this.tokenListModal = true;
      } catch (error) {
        await this.$store.dispatch("toaster/error", error.message);
      }
      this.mainLoading = false;
    },
    checkForFeeToken() {
      if (!this.chosenFeeToken && this.chosenToken && this.chosenToken.restricted === true) {
        for (const token of this.tokensList) {
          if (token.restricted === false) {
            this.cantFindFeeToken = false;
            return (this.chosenFeeToken = token);
          }
        }
        this.$store.dispatch("openModal", "NoTokenFound");
        this.cantFindFeeToken = true;
      } else {
        this.cantFindFeeToken = false;
      }
    },
    async chooseToken(token) {
      this.tokenListModal = false;
      this.chosenToken = token;
      await this.updateDecimals();
      await this.getFees();
      this.validateAmount(this.inputTotalSum);
    },
    chooseContact(contact) {
      this.chosenContract = contact;
      this.inputAddress = contact.address;
      this.contactsListModal = false;
    },
    async getWithdrawalTime() {
      this.mainLoading = true;
      this.withdrawTime = await this.$store.dispatch("wallet/getWithdrawalProcessingTime");
      this.mainLoading = false;
    },
    async getFees() {
      if (!this.hasValidAddress || (this.chosenToken.restricted && !this.chosenFeeToken) || !this.chosenToken) {
        console.log("getFees disabled", this.inputAddress, this.hasValidAddress, this.chosenToken, this.chosenFeeToken);
        this.feesObj = false;
        return;
      }
      this.feesLoading = true;

      /**
       * @todo refactor, extract validators from computed max amount
       */

      try {
        const tokenSymbol = this.chosenToken ? this.chosenToken.symbol : "ETH";
        this.feesObj = await this.$store.dispatch("wallet/getFees", {
          address: this.inputAddress,
          symbol: tokenSymbol,
          feeSymbol: this.chosenFeeToken ? this.chosenFeeToken.symbol : tokenSymbol,
          type: this.type,
        });
      } catch (error) {
        await this.$store.dispatch("toaster/error", error.message);
      }
      this.feesLoading = false;
    },
    getContactsList() {
      try {
        const walletAddress = walletData.get().syncWallet.address();
        if (process.client && window.localStorage.getItem("contacts-" + walletAddress)) {
          const contactsList = JSON.parse(window.localStorage.getItem("contacts-" + walletAddress));
          if (Array.isArray(contactsList)) {
            this.contactsList = contactsList;
          }
        }
      } catch (error) {
        console.log(error);
      }
    },
    saveContact() {
      if (this.saveContactInput.trim().length === 0) {
        this.saveContactModalError = `Name can't be empty`;
        return;
      } else {
        this.saveContactModalError = "";
      }
      try {
        this.getContactsList();
        for (let a = 0; a < this.contactsList.length; a++) {
          if (this.contactsList[a].address.toLowerCase() === this.inputAddress.toLowerCase()) {
            this.contactsList.splice(a, 1);
            break;
          }
        }
        this.contactsList.push({ name: this.saveContactInput.trim(), address: this.inputAddress });
        if (process.client) {
          window.localStorage.setItem("contacts-" + walletData.get().syncWallet.address(), JSON.stringify(this.contactsList));
        }
        this.getContactsList();
        this.saveContactModal = false;
        this.saveContactInput = "";
        this.saveContactModalError = "";
      } catch (error) {
        console.log(error);
      }
    },
    /**
     * @todo chosen change for chosen
     */
    async commitTransaction() {
      try {
        this.mainError = "";
        this.mainLoading = true;

        await this.$store.dispatch("wallet/restoreProviderConnection");
        if (this.isWithdrawal) {
          await this.withdraw();
        } else {
          await this.transfer();
        }
        this.mainLoading = false;
      } catch (error) {
        this.mainLoading = false;

        if (error.message) {
          if (error.message.includes("User denied")) {
            this.mainError = "";
          } else if (error.message.includes("Fee Amount is not packable")) {
            this.mainError = "Fee Amount is not packable";
          } else if (error.message.includes("Transaction Amount is not packable")) {
            this.mainError = "Transaction Amount is not packable";
          } else {
            this.mainError = error.message;
          }
        } else if (error.message && String(error.message).length < 60) {
          this.mainError = error.message;
        } else {
          this.mainError = "Transaction error";
        }
      }

      this.tip = "";
      return this.mainError === "";
    },
    async withdraw() {
      const syncProvider = walletData.get().syncProvider;
      this.tip = "Confirm the transaction to withdraw";

      const withdrawTransaction = await withdraw(
        this.inputAddress,
        this.chosenToken.symbol,
        this.getRealFeeToken.symbol,
        this.inputTotalSumBigNumber,
        this.fastWithdraw,
        this.feesObj[this.fastWithdraw === true ? "fast" : "normal"],
      );
      this.transactionAmount = this.inputTotalSumBigNumber;

      let receipt;
      if (!Array.isArray(withdrawTransaction)) {
        this.transactionHash = withdrawTransaction.txHash;
        this.transactionFee = withdrawTransaction.txData.tx.fee;
        this.inputAddress = withdrawTransaction.txData.tx.to;
        this.tip = "Waiting for the transaction to be mined...";
        receipt = await withdrawTransaction.awaitReceipt();
      } else {
        this.transactionHash = withdrawTransaction[0].txHash;
        this.transactionFee = withdrawTransaction[1].txData.tx.fee;
        this.inputAddress = withdrawTransaction[0].txData.tx.to;
        this.tip = "Waiting for the transaction to be mined...";
        receipt = await syncProvider.notifyTransaction(withdrawTransaction[0].txHash, "COMMIT");
      }
      await this.$store.dispatch("wallet/forceRefreshData");
      this.success = receipt.success;
      if (receipt.failReason) {
        throw new Error(receipt.failReason);
      }
    },
    async transfer() {
      const transferWithdrawWarning = localStorage.getItem("canceledTransferWithdrawWarning");
      if (!transferWithdrawWarning && this.transferWithdrawWarningDialog === false) {
        const accountExists = await this.accountExists(this.inputAddress);
        if (accountExists === false) {
          this.transferWithdrawWarningDialog = true;
          this.mainLoading = false;
          return;
        }
      }
      await this.getFees();
      this.tip = "Confirm the transaction to transfer";
      const transferTransaction = await transaction(this.inputAddress, this.chosenToken.symbol, this.getRealFeeToken.symbol, this.inputTotalSumBigNumber, this.feesObj.normal);
      this.transactionAmount = this.inputTotalSumBigNumber;

      let receipt;
      if (!Array.isArray(transferTransaction)) {
        this.transactionHash = transferTransaction.txHash;
        this.transactionFee = transferTransaction.txData.tx.fee;
        this.inputAddress = transferTransaction.txData.tx.to;
        this.tip = "Waiting for the transaction to be mined...";
        receipt = await transferTransaction.awaitReceipt();
      } else {
        this.transactionHash = transferTransaction[0].txHash;
        this.transactionFee = transferTransaction[1].txData.tx.fee;
        this.inputAddress = transferTransaction[0].txData.tx.to;
        this.tip = "Waiting for the transaction to be mined...";
        receipt = await transferTransaction[0].awaitReceipt();
      }
      this.tip = "Processing...";
      await this.$store.dispatch("wallet/forceRefreshData");
      this.success = receipt.success;
      if (receipt.failReason) {
        throw new Error(receipt.failReason);
      }
    },
    async accountExists(address) {
      const state = await walletData.get().syncProvider.getState(address);
      return state.id !== null;
    },
    warningDialogProceedTransfer() {
      if (this.transferWithdrawWarningCheckmark === true) {
        localStorage.setItem("canceledTransferWithdrawWarning", "true");
      }
      this.commitTransaction();
      this.$nextTick(() => {
        setTimeout(() => {
          this.transferWithdrawWarningDialog = false;
        }, 100);
      });
    },
    validateAmount(val) {
      // Make it so that if there is an error with the input
      // the dollar price is displayed as zero
      this.inputTotalSumBigNumber = null;
      this.hasValidAmount = false;

      /**
       * !!Important!! this is not part of a logic / UI / whatever.
       * It's ONLY simple way to invalidate values like 0.0000 which shouldn't trigger an error and can't be converted into BigNumber.
       * Just a check to keep button disabled and avoid showing a message.
       */
      if (!val || !parseFloat(val) || !this.chosenToken) {
        this.setMainError("");
        return false;
      }

      let inputAmount = null;

      /**
       * If validated too early
       */
      try {
        inputAmount = utils.parseToken(this.chosenToken.symbol, val);
      } catch (error) {
        let errorInfo = `Amount processing error. Common reason behind it — inaccurate amount. Try again paying attention to the decimal amount number format — it should help`;
        if (error.message && error.message.search("fractional component exceeds decimals") !== -1) {
          errorInfo = `Precision exceeded: ${this.chosenToken.symbol} doesn't support that many decimal digits`;
        }
        this.pushDigitsErrorValue(errorInfo);
        return false;
      }
      this.pushDigitsErrorValue();

      if (inputAmount.lte(0)) {
        this.hasValidAmount = false;
        return false;
      }

      this.inputTotalSum = val;
      this.inputTotalSumBigNumber = inputAmount;

      if (inputAmount.gt(this.transactionMaxAmount)) {
        this.setMainError(`Not enough ${this.chosenToken.symbol} to ${this.isWithdrawal ? "withdraw" : "transfer"} requested amount`);
        this.hasValidAmount = false;
        return false;
      }
      this.setMainError("");

      if (this.isWithdrawal || utils.isAmountPackable(this.inputTotalSumBigNumber)) {
        this.packingError = "";
      } else {
        this.packingError = "Max supported precision for transfers is 10 decimal digits";
      }

      return (this.hasValidAmount = true);
    },
  },
};
</script>
