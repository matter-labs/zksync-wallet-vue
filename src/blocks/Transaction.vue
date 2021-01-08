<template>
  <div class="transactionPage">
    <i-modal v-model="saveContactModal" class="prevent-close" size="md">
      <template slot="header">Save contact</template>
      <div>
        <div class="_padding-bottom-1">Contact name</div>
        <i-input v-model="saveContactInput" size="lg" placeholder="Name" maxlength="20" @keyup.enter="saveContact()"/>
        <div v-if="saveContactModalError" class="modalError _margin-top-1">{{ saveContactModalError }}</div>
        <i-button class="_margin-top-1" block variant="secondary" size="lg" @click="saveContact()">Save</i-button>
      </div>
    </i-modal>

    <div v-if="success === true" class="tileBlock">
      <div class="tileHeadline h3">
        <span>{{ isWithdrawal ? "Withdraw": "Transfer" }}</span>
      </div>
      <checkmark/>
      <p class="_text-center _margin-top-0">
        Your {{ isWithdrawal ? "withdrawal": "transaction" }} will be processed shortly. Use the transaction link to track the progress.
      </p>
      <a class="_display-block _text-center _margin-top-1" target="_blank"
         :href="`${blockExplorerLink}/transactions/${transactionHash}`">
        Link to the transaction&nbsp;<i class="fas fa-external-link"></i>
      </a>
      <div class="totalAmount smaller _margin-top-2">
        <div class="amount">
          <span>Recepient:</span>
          <span v-if="isOwnAddress" class="totalPrice">Own account</span>
          <span v-else-if="choosedContact" class="totalPrice">{{ choosedContact.name }}</span>
        </div>
        <wallet-address :wallet="inputAddress"/>
      </div>
      <div class="totalAmount _margin-top-1">
        <div class="headline">Amount:</div>
        <div class="amount">
          <span class="tokenSymbol">{{ choosedToken.symbol }}</span>
          {{ transactionAmount | formatToken(choosedToken.symbol) }}
          <span class="totalPrice">
            {{ transactionAmount | formatUsdAmount(choosedToken.tokenPrice, choosedToken.symbol) }}
          </span>
        </div>
      </div>
      <div class="totalAmount smaller _margin-top-1">
        <div class="headline">Fee:</div>
        <div class="amount">
          <span class="tokenSymbol">{{ getRealFeeToken.symbol }}</span>
          {{ transactionFee |formatToken(getRealFeeToken.symbol) }}
          <span class="totalPrice">
            {{ transactionFee | formatUsdAmount(getRealFeeToken.tokenPrice, getRealFeeToken.symbol) }}
          </span>
        </div>
      </div>
      <i-button block size="lg" variant="secondary" class="_margin-top-2" to="/account">Ok</i-button>
    </div>

    <div v-else-if="mainLoading===true" class="tileBlock">
      <div class="tileHeadline h3">{{ isWithdrawal ? "Withdraw": "Transfer" }}</div>
      <a v-if="transactionHash" class="_display-block _text-center" target="_blank"
         :href="`${blockExplorerLink}/transactions/${transactionHash}`">
        Link to the transaction&nbsp;<i
          class="fas fa-external-link"/>
      </a>
      <p v-if="tip" class="_display-block _text-center _margin-top-1">{{ tip }}</p>
      <div v-if="mainLoading===true" class="nothingFound _padding-y-2">
        <loader/>
      </div>
    </div>

    <div v-else class="tileBlock">
      <div class="tileHeadline withBtn h3">
        <nuxt-link :to="(fromRoute && fromRoute.fullPath!==$route.fullPath)?fromRoute:'/account'" class="returnBtn">
          <i class="far fa-long-arrow-alt-left"></i>
        </nuxt-link>
        <div>
          {{ isWithdrawal ? "Withdraw": "Transfer" }}
        </div>
      </div>

      <div class="_padding-bottom-1">Address</div>

      <i-input v-model="inputAddress" size="lg" placeholder="0x address" type="text" maxlength="42" @keyup.enter="commitTransaction()"/>

      <i-row class="_margin-top-1">
        <i-column v-if="!choosedContact && !isOwnAddress" xs="12" :md="canSaveContact?7:12">
          <i-button block link variant="secondary" @click="contactsListModal=true">Select from contacts</i-button>
        </i-column>
        <i-column v-else xs="12" :md="canSaveContact?7:12">
          <i-button block link variant="secondary" @click="contactsListModal=true">
            {{ isOwnAddress ? "Own account": choosedContact.name }}&nbsp;&nbsp;<i class="far fa-angle-down"/>
          </i-button>
        </i-column>
        <i-column xs="12" md="5">
          <i-button v-if="canSaveContact" block link variant="secondary" @click="saveContactModal=true">
            Save to contacts
          </i-button>
        </i-column>
      </i-row>
      <br>
      <div class="_padding-bottom-1">Amount / asset</div>
      <div>
        <i-input v-model="inputTotalSum" size="lg" :precision="decimalPrecision" type="text" @keyup.enter="commitTransaction()">
          <i-button v-if="!choosedToken" slot="append" block link variant="secondary" @click="openTokenList()">
            Select token
          </i-button>
          <i-button v-else slot="append" block class="selectedTokenBtn" link variant="secondary" @click="openTokenList()">
            <span class="tokenSymbol">{{ choosedToken.symbol }}</span>&nbsp;&nbsp;<i class="far fa-angle-down"/>
          </i-button>
        </i-input>
      </div>
      <div v-if="choosedToken" class="_display-flex _justify-content-space-between _margin-top-1">
        <div class="totalPrice">
          {{ inputTotalSumBigNumber | formatUsdAmount(choosedToken.tokenPrice, choosedToken.symbol) }}
        </div>
        <div class="maxAmount" @click="chooseMaxAmount()">
          Max: {{ transactionMaxAmount | formatToken(choosedToken.symbol) }}
        </div>
      </div>

      <i-radio-group v-if="choosedToken && isWithdrawal && (!choosedFeeToken || choosedFeeToken.symbol===choosedToken.symbol) && feesObj" v-model="fastWithdraw"
                     class="_margin-top-2">
        <i-radio :value="false">
          Normal withdraw
          (
          <strong>Fee:</strong>
          <span v-if="feesObj && feesObj['normal']">
            {{ feesObj && feesObj["normal"] |formatToken(getRealFeeToken.symbol) }}
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
          Fast withdraw
          (
          <strong>Fee:</strong>
          <span v-if="feesObj && feesObj['fast']">
            {{ feesObj && feesObj["fast"] |formatToken(getRealFeeToken.symbol) }}
            <span class="tokenSymbol">{{ getRealFeeToken.symbol }}</span>
            <span class="totalPrice">
              {{ feesObj["fast"] | formatUsdAmount(getRealFeeToken.tokenPrice, getRealFeeToken.symbol) }}
            </span>
          </span>
          <span v-else class="totalPrice">Loading...</span>

          ).<br>
          Processing time: {{ withdrawTime.fast | getTimeString }}
        </i-radio>
      </i-radio-group>

      <div v-else-if="choosedToken && isWithdrawal && feesObj" class="totalPrice _text-center _margin-top-1">
        Only normal withdraw ({{ withdrawTime.normal | getTimeString }}) is available when using different fee token
      </div>

      <div v-if="mainError" class="errorText _text-center _margin-top-1">{{ mainError }}</div>

      <i-button block size="lg" variant="secondary" class="_margin-top-1" :disabled="isTransferBlocked" @click="commitTransaction()">
        <i v-if="isWithdrawal" class="fas fa-hand-holding-usd"></i>
        <i v-else class="fas fa-paper-plane"></i>
        {{ isWithdrawal ? "Withdraw": "Transfer" }}
      </i-button>
      <div v-if="cantFindFeeToken===true && feesObj && choosedToken && hasValidAddress" class="errorText _text-center _margin-top-1">
        <span class="tokenSymbol">{{ choosedToken.symbol }}</span> is not suitable for paying fees<br>
        No available tokens on your balance to pay the fee
      </div>
      <div v-else-if="(feesObj || feesObj[fastWithdraw ? 'fast': 'normal'] || feesLoading) && choosedToken && hasValidAddress" class="_text-center _margin-top-1">
        Fee:
        <span v-if="feesLoading" class="totalPrice">Loading...</span>
        <span v-else>
          {{ feesObj[fastWithdraw===true ? "fast": "normal"] | formatToken(getRealFeeToken.symbol) }} <span class="tokenSymbol">{{ getRealFeeToken.symbol }}</span>
          <span class="totalPrice">
            {{ feesObj[fastWithdraw===true ? "fast": "normal"] | formatUsdAmount(getRealFeeToken.tokenPrice, getRealFeeToken.symbol) }}
          </span>
          <span class="chooseFeeToken" @click="chooseFeeTokenModal=true">Choose fee token</span>
        </span>
      </div>
    </div>

    <i-modal v-model="tokenListModal" size="md">
      <template slot="header">Balances in L2</template>
      <choose-fee-token
          v-model="tokenListModal"
          :show-restricted="true"
          :show-zero-balance="true"
          :show-cant-find-token="true"
          @selectToken="tokenListModal=false"
          @input="chooseToken"
      />
    </i-modal>

    <i-modal v-model="contactsListModal" size="md">
      <template slot="header">Contacts</template>
      <div>
        <i-input v-if="contactSearch.trim() || displayedContactsList.length!==0" v-model="contactSearch" placeholder="Filter contacts" maxlength="20">
          <i slot="prefix" class="far fa-search"></i>
        </i-input>
        <div class="contactsListContainer">
          <div v-if="!contactSearch.trim() && displayedContactsList.length===0 && type!=='withdraw'" class="nothingFound">
            <span>The contact list is empty</span>
          </div>
          <div v-else-if="contactSearch.trim() && displayedContactsList.length===0" class="nothingFound">
            <span>Your search <b>"{{ contactSearch }}"</b> did not match any contacts</span>
          </div>
          <template v-else>
            <div v-if="!contactSearch.trim() && type==='withdraw'" class="contactItem"
                 @click.self="chooseContact({name: 'Own account', address: ownAddress})">
              <user-img :wallet="ownAddress"/>
              <div class="contactInfo">
                <div class="contactName">Own account</div>
                <div class="contactAddress walletAddress">{{ ownAddress }}</div>
              </div>
            </div>
            <div v-for="(item, index) in displayedContactsList" :key="index" class="contactItem"
                 @click.self="chooseContact(item)">
              <user-img :wallet="item.address"/>
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
      <choose-fee-token v-model="choosedFeeToken" @selectToken="chooseFeeTokenModal=false"/>
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

      //isTransferBlocked: true,
      zksync: null,
      contactsListModal: false,
      tokenListModal: false,
      chooseFeeTokenModal: false,
      hasValidAmount: false,
      //hasBlockEnforced: false,

      mainLoading: true,
      withdrawTime: false,
      feesObj: {},
      feesLoading: false,

      inputTotalSum: null,
      inputTotalSumBigNumber: null,

      mainError: "",
      inputAddress: this.type === "withdraw" ? walletData.get().syncWallet.address() : "",
      fastWithdraw: false,

      contactSearch: "",
      contactsList: [],
      choosedContact: false,
      saveContactInput: "",
      saveContactModalError: "",
      saveContactModal: false,

      tokenSearch: "",
      tokensList: [],
      choosedToken: false,
      cantFindTokenModal: false,

      choosedFeeToken: false,
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
    isWithdrawal: function () {
      return this.type === "withdraw";
    },
    hasBlockEnforced: function() {
      return !this.inputTotalSumBigNumber 
      || !this.feesObj 
      || !this.getRealFeeToken 
      || !this.inputTotalSumBigNumber
      || !this.inputTotalSum || !parseFloat(this.inputTotalSum) || !this.choosedToken;
    },
    getRealFeeToken: function () {
      return this.choosedFeeToken ? this.choosedFeeToken : this.choosedToken;
    },
    canSaveContact: function () {
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
      return !isInContactList && !this.isOwnAddress && !this.choosedContact && this.hasValidAddress;
    },
    isAccountLocked: function () {
      return this.$store.getters["wallet/isAccountLocked"];
    },
    displayedContactsList: function () {
      if (!this.contactSearch.trim()) {
        return this.contactsList;
      }
      return this.contactsList.filter((e) => e.name.toLowerCase().includes(this.contactSearch.trim().toLowerCase()));
    },

    /**
     *
     * @return boolean
     */
    hasValidAddress: function () {
      return this.inputAddress && validations.eth.test(this.inputAddress);
    },
    isTransferBlocked: function() {
      const isTransferAvaliable = this.hasValidAddress 
      && this.hasValidAmount 
      && this.choosedToken
      && !this.hasErrors 
      && !this.mainError
      && !this.hasBlockEnforced;

      return !isTransferAvaliable;
    },
    isOwnAddress: function () {
      return this.inputAddress.toLowerCase() === walletData.get().syncWallet.address().toLowerCase();
    },
    ownAddress: function () {
      return walletData.get().syncWallet.address();
    },
    enoughTokenFee: function () {
      if (!this.feesObj || !this.getRealFeeToken || !this.inputTotalSumBigNumber) {
        this.setMainError(``, true);
        return false;
      }
      const feeAmount = this.fastWithdraw === true ? this.feesObj["fast"] : this.feesObj["normal"];
      if (feeAmount.lte(0)) {
        this.setMainError(`Fee requires recalculation. Reload the page and try again.`);
        return false;
      }

      if (this.getRealFeeToken && this.getRealFeeToken.rawBalance["lt"] && this.getRealFeeToken.rawBalance.lt(feeAmount)) {
        this.setMainError(`Not enough ${this.getRealFeeToken.symbol} to pay the fee`);
        return false;
      }
      this.setMainError("");
      return true;
    },
    blockExplorerLink: function () {
      return APP_ZKSYNC_BLOCK_EXPLORER;
    },
    hasErrors: function() {
      if(!this.choosedToken || !this.decimalPrecision) {
        return false; 
      }
      try {
        let noErrors = true;
        if (this.choosedFeeToken) {
          if (!utils.isDecimalsValid(this.choosedToken.symbol, this.choosedFeeToken.balance, this.decimalPrecision)) {
            this.setMainError(`Amount out of range, ${this.choosedToken.symbol} doesn't allows that much decimal digits`);
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
      if(!this.choosedToken) {
        return 0;
      }

      const bigNumBalance = utils.parseToken(this.choosedToken.symbol, this.choosedToken.balance);
      if (bigNumBalance.lte(0)) {
        return 0;
      }

      let closestPackableInput = bigNumBalance;
      if ((!this.choosedFeeToken || this.choosedFeeToken.symbol === this.choosedToken.symbol) && this.hasValidAddress && !this.cantFindFeeToken) {
        const amountToParse = this.fastWithdraw === true ? this.feesObj.fast : this.feesObj.normal;
        if (amountToParse === undefined) {
          return 0;
        }
        const maxAmount = bigNumBalance.sub(amountToParse);
        if (maxAmount.lte(0)) {
          this.setMainError(`You don't have enough ${this.choosedToken.symbol}`);
          return 0;
        }
        closestPackableInput = maxAmount;
      }
      const realMaxAmount = this.zksync.closestPackableTransactionAmount(closestPackableInput);

      if (!this.inputTotalSumBigNumber) {
        this.setMainError("", true);
      } else if (realMaxAmount.lt(this.inputTotalSumBigNumber)) {
        this.setMainError(`You don't have enough ${this.choosedToken.symbol}`);
      } else {
        this.setMainError("");
      }

      return realMaxAmount;
    }
  },
  watch: {
    hasBlockEnforced(val) {
      console.log('block enforced changed: ', val);
    },
    inputAddress(addressValue) {
      if (this.hasValidAddress) {
        this.getFees();
      }
    },
    inputTotalSum(val) {
      this.validateAmount(val);
    },
    choosedToken: {
      deep: true,
      async handler(val) {
        if (this.isWithdrawal && val && this.choosedFeeToken && val.symbol !== this.choosedFeeToken.symbol) {
          this.fastWithdraw = false;
        }
        await this.updateDecimals();
        this.checkForFeeToken();
        this.validateAmount(this.inputTotalSum);
      },
    },
    choosedFeeToken: {
      deep: true,
      async handler(val) {
        if (this.isWithdrawal && val && val.symbol !== this.choosedToken.symbol) {
          this.fastWithdraw = false;
        }
        await this.getFees();
        this.validateAmount(this.inputTotalSum);
      },
    },
  },
  async mounted() {
    this.zksync = await walletData.zkSync();
    if (this.$route.query["w"]) {
      this.inputAddress = this.$route.query["w"];
    }
    if (this.$route.query["token"]) {
      this.mainLoading = true;
      /**
       * @type {Array}
       */
      const list = await this.$store.dispatch("wallet/getzkBalances");
      this.tokensList = list.map((e) => ({ ...e, balance: e.balance }));
      const tokenLoaded = this.tokensList.filter((singleTokenObj) => singleTokenObj.symbol === this.$route.query["token"]).shift();
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
    chooseMaxAmount: function () {
      this.inputTotalSum = utils.handleFormatToken(this.choosedToken.symbol, this.transactionMaxAmount);
    },
    updateDecimals: async function () {
      const decimals = await this.$store.dispatch("tokens/getTokenDecimals", this.choosedToken.symbol);
      this.decimalPrecision = this.choosedToken && decimals ? decimals : 18;
    },
    handleFeeObjectProcessing: function () {
      if (!this.calculatedFees) {
        return "";
      }
      const calculatedFee = this.calculatedFees[this.fastWithdraw === true ? "fast" : "normal"];
      if (!calculatedFee) {
        return "";
      }
      return calculatedFee;
    },
    setMainError: function (errorMessage) {
      this.mainError = errorMessage;
    },
    setContact: function (item = false) {
      this.choosedContact = item;
    },
    openTokenList: async function () {
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
    checkForFeeToken: function () {
      if (!this.choosedFeeToken && this.choosedToken && this.choosedToken.restricted === true) {
        for (const token of this.tokensList) {
          if (token.restricted === false) {
            this.cantFindFeeToken = false;
            return (this.choosedFeeToken = token);
          }
        }
        this.$store.dispatch("openModal", "NoTokenFound");
        this.cantFindFeeToken = true;
      } else {
        this.cantFindFeeToken = false;
      }
    },
    chooseToken: async function (token) {
      this.tokenListModal = false;
      this.choosedToken = token;
      this.validateAmount(this.inputTotalSum);
      await this.getFees();
    },
    chooseContact: function (contact) {
      this.choosedContact = contact;
      this.inputAddress = contact.address;
      this.contactsListModal = false;
    },
    getWithdrawalTime: async function () {
      this.mainLoading = true;
      this.withdrawTime = await this.$store.dispatch("wallet/getWithdrawalProcessingTime");
      this.mainLoading = false;
    },
    getFees: async function () {
      if (!this.hasValidAddress || (this.choosedToken.restricted && !this.choosedFeeToken) || !this.choosedToken) {
        console.log("getFees disabled", this.inputAddress, this.hasValidAddress, this.choosedToken, this.choosedFeeToken);
        this.feesObj = false;
        return;
      }
      this.feesLoading = true;

      /**
       * @todo refactor, extract validators from computed max amount
       */

      try {
        const tokenSymbol = this.choosedToken ? this.choosedToken.symbol : "ETH";
        this.feesObj = await this.$store.dispatch("wallet/getFees", {
          address: this.inputAddress,
          symbol: tokenSymbol,
          feeSymbol: this.choosedFeeToken ? this.choosedFeeToken.symbol : tokenSymbol,
          type: this.type,
        });
      } catch (error) {
        await this.$store.dispatch("toaster/error", error.message);
      }
      this.feesLoading = false;
    },

    getContactsList: function () {
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
    saveContact: function () {
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
     * @todo choosed change for chosen
     */
    commitTransaction: async function () {
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

        console.log(error);
        if (error.message) {
          if (error.message.includes("User denied")) {
            this.mainError = "";
          } else {
            if (error.message.includes("Fee Amount is not packable")) {
              this.mainError = "Fee Amount is not packable";
            }
            if (error.message.includes("Transaction Amount is not packable")) {
              this.mainError = "Transaction Amount is not packable";
            }
          }
          this.mainError = error.message;
        } else {
          if (error.message && String(error.message).length < 60) {
            this.mainError = error.message;
          } else {
            this.mainError = "Transaction error";
          }
        }
      }

      this.tip = "";
      return this.mainError === "";
    },
    withdraw: async function () {
      const syncProvider = walletData.get().syncProvider;
      this.tip = "Confirm the transaction to withdraw";

      const withdrawTransaction = await withdraw(
        this.inputAddress,
        this.choosedToken.symbol,
        this.getRealFeeToken.symbol,
        this.inputTotalSumBigNumber,
        this.fastWithdraw,
        this.feesObj[this.fastWithdraw === true ? "fast" : "normal"],
      );
      this.transactionAmount = this.inputTotalSumBigNumber;

      let receipt = null;
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
      if(receipt.failReason) {
        throw new Error(receipt.failReason);
      }
    },
    transfer: async function () {
      await this.getFees();
      this.tip = "Confirm the transaction to transfer";
      const transferTransaction = await transaction(this.inputAddress, this.choosedToken.symbol, this.getRealFeeToken.symbol, this.inputTotalSumBigNumber, this.feesObj.normal);
      this.transactionAmount = this.inputTotalSumBigNumber;

      let receipt = null;
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
      if(receipt.failReason) {
        throw new Error(receipt.failReason);
      }
    },
    validateAmount(val) {
      // Make it so that if there is an error with the input
      // the dollar price is displayed as zero
      this.inputTotalSumBigNumber = null;
      this.hasValidAmount = false;
      
      /**
       * !!Important!! this is not part of a logic / UI / whatever.
       * It's ONLY simple way to invalidate values like 0.0000 which shouldn't trigger an error and can't be converted into BigNumber.
       * Just a check to keep button disabled and avoid shoing a message.
       */
      if (!val || !parseFloat(val) || !this.choosedToken) {
        this.setMainError("", true);
        return false;
      }

      if (!utils.isDecimalsValid(this.choosedToken.symbol, val, this.decimalPrecision)) {
        this.setMainError(`Amount out of range, ${this.choosedToken.symbol} allows ${this.decimalPrecision} decimal digits max`);
        return false;
      }

      let inputAmount = null;

      /**
       * If validated too early
       */
      try {
        inputAmount = utils.parseToken(this.choosedToken.symbol, val);
      } catch (error) {
        let errorInfo = `Amount processing error. Common reason behind it — inaccurate amount. Try again paying attention to the decimal amount number format — it should help`;
        if (error.message && error.message.search("fractional component exceeds decimals") !== -1) {
          errorInfo = `Introduced amount is out of range. Note: ${this.choosedToken.symbol} doesn't allows that much amount of decimal digits`;
        }
        this.setMainError(errorInfo);
        return false;
      }

      if (inputAmount.lte(0)) {
        this.hasValidAmount = false;
        return false;
      }

      this.inputTotalSum = val;
      this.inputTotalSumBigNumber = inputAmount;


      if (inputAmount.gt(this.transactionMaxAmount)) {
        this.setMainError(`Not enough ${this.choosedToken.symbol} to ${this.isWithdrawal ? "withdraw" : "transfer"} requested amount`);
        this.hasValidAmount = false;
        return false;
      }
      this.setMainError("");

      return (this.hasValidAmount = true);
    },
  },
};
</script>
