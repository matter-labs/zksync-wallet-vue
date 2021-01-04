<template>
  <div class="transactionPage">
    <i-modal v-model="cantFindTokenModal" size="md">
      <template slot="header">Can't find a token</template>
      <div>
        <p>zkSync currently supports the most popular tokens, we will be adding more over time. <a
            href="//zksync.io/contact.html" target="_blank" rel="noopener noreferrer">Let us know what tokens you
          need</a>!</p>
      </div>
    </i-modal>
    <i-modal v-model="saveContactModal" class="prevent-close" size="md">
      <template slot="header">Save contact</template>
      <div>
        <div class="_padding-bottom-1">Contact name</div>
        <i-input v-model="saveContactInput" size="lg" placeholder="Name" maxlength="20" @keyup.enter="saveContact()"/>
        <div v-if="saveContactModalError" class="modalError _margin-top-1">{{ saveContactModalError }}</div>
        <i-button class="_margin-top-1" block variant="secondary" size="lg" @click="saveContact()">Save</i-button>
      </div>
    </i-modal>
    <account-unlock v-if="isAccountLocked" :choosed-token="choosedToken" @selectToken="openTokenList()"/>
    <div v-else-if="success === true" class="tileBlock">
      <div class="tileHeadline h3">
        <span>{{ type==='withdraw' ? 'Withdraw' : 'Transfer' }}</span>
      </div>
      <checkmark/>
      <p class="_text-center _margin-top-0">Your {{ type==='withdraw' ? 'withdrawal' : 'transaction' }} will be processed
        shortly. Use the transaction link to track the progress.</p>
      <a class="_display-block _text-center _margin-top-1" target="_blank"
         :href="`${blockExplorerLink}/transactions/${transactionHash}`">Link to the transaction <i
          class="fas fa-external-link"></i></a>
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
        <div class="amount"><span class="tokenSymbol">{{ choosedToken.symbol }}</span> {{ transactionAmount.toFixed(4) }} <span
            class="totalPrice">{{ getFormattedPrice(choosedToken.tokenPrice, transactionAmount) }}</span></div>
      </div>
      <div class="totalAmount smaller _margin-top-1">
        <div class="headline">Fee:</div>
        <div class="amount">
          <span class="tokenSymbol">{{ choosedFeeToken ? choosedFeeToken.symbol : choosedToken.symbol }}</span>
          {{ getFormattedAmount(choosedFeeToken ? choosedFeeToken.symbol : choosedToken.symbol, transactionFee) }}
          <span class="totalPrice">
            {{ getFormattedPrice(choosedFeeToken ? choosedFeeToken.tokenPrice : choosedToken.tokenPrice, transactionFee) }}
          </span>
        </div>
      </div>
      <i-button block size="lg" variant="secondary" class="_margin-top-2" to="/account">Ok</i-button>
    </div>
    <div v-else-if="mainLoading===true" class="tileBlock">
      <div class="tileHeadline h3">{{ type==='withdraw' ? 'Withdraw' : 'Transfer' }}</div>
      <a v-if="transactionHash" class="_display-block _text-center" target="_blank"
         :href="`${blockExplorerLink}/transactions/${transactionHash}`">Link to the transaction <i
          class="fas fa-external-link"></i></a>
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
          {{ type==='withdraw' ? 'Withdraw' : 'Transfer' }}
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
            {{ isOwnAddress ? 'Own account' : choosedContact.name }}&nbsp;&nbsp;<i class="far fa-angle-down"></i>
          </i-button>
        </i-column>
        <i-column xs="12" md="5">
          <i-button v-if="canSaveContact" block link variant="secondary" @click="saveContactModal=true">Save to
            contacts
          </i-button>
        </i-column>
      </i-row>

      <br>

      <div class="_padding-bottom-1">Amount / asset</div>
      <i-input v-model="inputTotalSum" size="lg" placeholder="0.00" type="number" @keyup.enter="commitTransaction()"><!-- @keydown="filterNumbers" -->
        <i-button v-if="!choosedToken" slot="append" block link variant="secondary" @click="openTokenList()">
          Select token
        </i-button>
        <i-button v-else slot="append" class="selectedTokenBtn" block link variant="secondary"
                  @click="openTokenList()"><span class="tokenSymbol">{{ choosedToken.symbol }}</span>&nbsp;&nbsp;<i class="far fa-angle-down"></i>
        </i-button>
      </i-input>
      <div v-if="choosedToken" class="_display-flex _justify-content-space-between _margin-top-1">
        <div class="totalPrice">
          {{ getFormattedPrice(choosedToken.tokenPrice, inputTotalSum) }}
        </div>
        <div class="maxAmount" @click="inputTotalSum=transactionMaxAmount>0? getFormattedAmount(choosedToken.symbol, transactionMaxAmount):0">Max:
          {{ transactionMaxAmount > 0 ? getFormattedAmount(choosedToken.symbol, transactionMaxAmount) : 0 }}
        </div>
      </div>
      <div v-if="choosedToken && inputTotalSum>transactionMaxAmount" class="errorText _text-center _margin-top-1">
        Not enough <span class="tokenSymbol">{{ choosedToken.symbol }}</span> to perform a transaction
      </div>

      <i-radio-group v-if="choosedToken && type==='withdraw' && (!choosedFeeToken || choosedFeeToken.symbol===choosedToken.symbol)" v-model="fastWithdraw" class="_margin-top-2">
        <i-radio :value="false">
          Normal withdraw (Fee: <span v-if="feesObj">{{ feesObj.normal && feesObj.normal.toFixed(4) }} <span class="tokenSymbol">{{
            choosedFeeToken ? choosedFeeToken.symbol : choosedToken.symbol
          }}</span></span><span v-else class="totalPrice">Loading...</span>).<br>
          Processing time: {{ getTimeString(withdrawTime.normal) }}
        </i-radio>
        <i-radio :value="true">
          Fast withdraw (Fee: <span v-if="feesObj">{{ feesObj.fast && feesObj.fast.toFixed(4) }} <span class="tokenSymbol">{{
            choosedFeeToken ? choosedFeeToken.symbol : choosedToken.symbol
          }}</span></span><span v-else class="totalPrice">Loading...</span>).<br>
          Processing time: {{ getTimeString(withdrawTime.fast) }}
        </i-radio>
      </i-radio-group>
      <div v-else-if="choosedToken && type==='withdraw'" class="totalPrice _text-center _margin-top-1">Only normal withdraw ({{ getTimeString(withdrawTime.normal) }}) is available
        when using different fee token
      </div>

      <div v-if="mainError" class="errorText _text-center _margin-top-1">{{ mainError }}</div>

      <i-button block size="lg" variant="secondary" class="_margin-top-1"
                :disabled="!enoughTokenFee || !isAddressValid || !inputTotalSum || inputTotalSum<=0 || !feesObj || !choosedToken || feesLoading || inputTotalSum>transactionMaxAmount"
                @click="commitTransaction()">
        <i v-if="type!=='withdraw'" class="fas fa-paper-plane"></i>
        <i v-else class="fas fa-hand-holding-usd"></i>
        {{ type==='withdraw' ? 'Withdraw' : 'Transfer' }}
      </i-button>
      <div v-if="cantFindFeeToken===true && feesObj && choosedToken && isAddressValid"
           class="errorText _text-center _margin-top-1">
        <span class="tokenSymbol">{{ choosedToken.symbol }}</span> is not suitable for paying fees<br>
        No available tokens on your balance to pay the fee
      </div>
      <div v-else-if="(feesObj || feesLoading) && choosedToken && isAddressValid" class="_text-center _margin-top-1">
        Fee:
        <span v-if="feesLoading" class="totalPrice">Loading...</span>
        <span v-else>
          {{
            feesObj[fastWithdraw===true ? 'fast' : 'normal']
          }} <span class="tokenSymbol">{{ choosedFeeToken ? choosedFeeToken.symbol : choosedToken.symbol }}</span>
          <span class="totalPrice">
            {{ getFormattedPrice(choosedFeeToken ? choosedFeeToken.tokenPrice : choosedToken.tokenPrice, feesObj[fastWithdraw===true ? 'fast' : 'normal']) }}
          </span>
          <span class="chooseFeeToken" @click="chooseFeeTokenModal=true">Choose fee token</span>
        </span>
        <div v-if="enoughTokenFee===false && feesLoading===false && choosedFeeToken.symbol!==choosedToken.symbol" class="errorText _text-center _margin-top-1">
          Not enough <span class="tokenSymbol">{{ choosedFeeToken.symbol }}</span> to pay the fee
        </div>
      </div>
    </div>
    <i-modal v-model="tokenListModal" size="md">
      <template slot="header">Balances in L2</template>
      <div>
        <i-input v-model="tokenSearch" placeholder="Filter balances in L2" maxlength="10">
          <i slot="prefix" class="far fa-search"></i>
        </i-input>
        <div class="tokenListContainer">
          <div v-for="item in displayedTokenList" :key="item.symbol" class="tokenItem" @click="chooseToken(item)">
            <div class="tokenSymbol">{{ item.symbol }}</div>
            <div class="rightSide">
              <div class="balance">{{ item.formatedBalance }}</div>
            </div>
          </div>
          <div v-if="tokenSearch && displayedTokenList.length===0" class="nothingFound">
            <span>Your search <b>"{{ tokenSearch }}"</b> did not match any tokens</span>
          </div>
          <div v-else-if="displayedTokenList.length===0" class="nothingFound">
            <span>No balances yet. Please make a deposit or request money from someone!</span>
          </div>
        </div>
        <i-button block link size="lg" variant="secondary" class="_margin-top-1" @click="tokenListModal=false;cantFindTokenModal=true">
          Can't find a token?
        </i-button>
      </div>
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
import AccountUnlock from "@/blocks/AccountUnlock.vue";
import ChooseFeeToken from "@/blocks/ChooseFeeToken.vue";

import Checkmark from "@/components/Checkmark.vue";
import userImg from "@/components/userImg.vue";
import walletAddress from "@/components/walletAddress.vue";

import { transaction, withdraw } from "@/plugins/walletActions/transaction.js";
import utils from "@/plugins/utils.js";
import validations from "@/plugins/validations.js";
import { walletData } from "@/plugins/walletData.js";
import { APP_ZKSYNC_BLOCK_EXPLORER } from "@/plugins/build";

const timeCalc = (timeInSec) => {
  const hours = Math.floor(timeInSec / 60 / 60);
  const minutes = Math.floor(timeInSec / 60) - hours * 60;
  const seconds = timeInSec - hours * 60 * 60 - minutes * 60;

  return {
    hours: hours,
    minutes: minutes,
    seconds: seconds,
  };
};
const handleTimeAmount = (time, string) => `${time} ${string}${time > 1 ? "s" : ""}`;

export default {
  components: {
    userImg,
    Checkmark,
    walletAddress,
    AccountUnlock,
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
      zksync: null,
      contactsListModal: false,
      tokenListModal: false,
      chooseFeeTokenModal: false,

      mainLoading: true,
      withdrawTime: false,
      feesObj: {},
      feesLoading: false,

      inputTotalSum: null,
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
      return !isInContactList && !this.isOwnAddress && !this.choosedContact && this.isAddressValid;
    },
    isAccountLocked: function () {
      return this.$store.getters["wallet/isAccountLocked"];
    },
    displayedTokenList: function () {
      if (!this.tokenSearch.trim()) {
        return this.tokensList.filter((e) => (this.isAccountLocked === true ? e.restricted === false : true));
      }
      return this.tokensList.filter(
        (e) => (this.isAccountLocked === true ? e.restricted === false : true) && e.balance > 0 && e.symbol.toLowerCase().includes(this.tokenSearch.trim().toLowerCase()),
      );
    },
    displayedContactsList: function () {
      if (!this.contactSearch.trim()) {
        return this.contactsList;
      }
      return this.contactsList.filter((e) => e.name.toLowerCase().includes(this.contactSearch.trim().toLowerCase()));
    },
    isAddressValid: function () {
      return validations.eth.test(this.inputAddress);
    },
    isOwnAddress: function () {
      return this.inputAddress.toLowerCase() === walletData.get().syncWallet.address().toLowerCase();
    },
    ownAddress: function () {
      return walletData.get().syncWallet.address();
    },
    transactionMaxAmount: function () {
      this.checkBalanceEnoughForFeePayment();
      const bigNumBalance = utils.parseToken(this.choosedToken.symbol, this.choosedToken.balance);
      if (bigNumBalance < 0) {
        return 0;
      }

      if ((!this.choosedFeeToken || this.choosedFeeToken.symbol === this.choosedToken.symbol) && this.isAddressValid && !this.cantFindFeeToken) {
        const amountToParse = this.fastWithdraw === true ? this.feesObj.fast : this.feesObj.normal;
        if (amountToParse === undefined) {
          return 0;
        }
        const bigNumFee = utils.parseToken(this.choosedToken.symbol, amountToParse);

        const maxAmount = bigNumBalance.sub(bigNumFee);

        if (maxAmount.lte(0)) {
          return 0;
        }
        return utils.handleFormatToken(this.choosedToken.symbol, this.zksync.closestPackableTransactionAmount(maxAmount));
      } else {
        return utils.handleFormatToken(this.choosedToken.symbol, this.zksync.closestPackableTransactionAmount(bigNumBalance));
      }
    },
    enoughTokenFee: function () {
      return !(this.feesObj && this.choosedFeeToken && this.choosedFeeToken.balance < (this.fastWithdraw === true ? this.feesObj.fast : this.feesObj.normal));
    },
    blockExplorerLink: function () {
      return APP_ZKSYNC_BLOCK_EXPLORER;
    },
  },
  watch: {
    inputAddress() {
      if (this.isAddressValid) {
        this.getFees();
      }
    },
    inputTotalSum(val) {
      if (val.toString().length === 0) {
        return;
      }
      const validate = utils.validateNumber(val.toString());
      if (val !== validate) {
        this.inputTotalSum = validate;
      }
    },
    choosedToken: {
      deep: true,
      handler(val) {
        if (this.type === "withdraw" && val && this.choosedFeeToken && val.symbol !== this.choosedFeeToken.symbol) {
          this.fastWithdraw = false;
        }
        this.checkForFeeToken();
      },
    },
    choosedFeeToken: {
      deep: true,
      handler(val) {
        if (this.type === "withdraw" && val && val.symbol !== this.choosedToken.symbol) {
          this.fastWithdraw = false;
        }
        this.getFees();
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
      this.$store.dispatch("wallet/getzkBalances").then((list) => {
        this.tokensList = list.map((e) => ({ ...e, balance: e.balance }));
        const tokenLoaded = this.tokensList.filter((singleTokenObj) => singleTokenObj.symbol === this.$route.query["token"]).shift();
        this.chooseToken(tokenLoaded);
        this.mainLoading = false;
      });
    }
    this.getContactsList();
    if (this.type === "withdraw") {
      await this.getWithdrawalTime();
    } else {
      this.mainLoading = false;
    }
  },
  methods: {
    setContact: function (item = false) {
      this.choosedContact = item;
    },
    checkBalanceEnoughForFeePayment: function () {
      const bigNumBalance = utils.parseToken(this.choosedToken.symbol, this.choosedToken.balance);
      /**
       * Checking balance (handle situation with 0 or less then 0 balance)
       */
      if (bigNumBalance < 0) {
        this.$store.dispatch("toaster/error", `You don't have enough ${this.choosedToken.symbol}  balance to withdraw`);
      }

      if ((!this.choosedFeeToken || this.choosedFeeToken.symbol === this.choosedToken.symbol) && this.isAddressValid && !this.cantFindFeeToken) {
        const amountToParse = this.fastWithdraw === true ? this.feesObj.fast : this.feesObj.normal;

        if (amountToParse !== undefined) {
          const bigNumFee = utils.parseToken(this.choosedToken.symbol, amountToParse);
          if (bigNumBalance - bigNumFee < 0) {
            this.$store.dispatch("toaster/error", `You don't have enough ${this.choosedToken.symbol} balance to pay fee in. Choose another token for the fee payment`);
            this.checkForFeeToken();
          }
        }
      }
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
        this.cantFindFeeToken = true;
      } else {
        this.cantFindFeeToken = false;
      }
    },
    getFormattedAmount: function (token, amount) {
      return utils.handleFormatToken(token, +amount);
    },
    getFormattedPrice: function (price, amount) {
      return utils.getFormatedTotalPrice(price, amount);
    },
    handleExponentialNumber: function (symbol, amount) {
      return utils.parseToken(symbol, amount);
    },
    chooseToken: async function (token) {
      this.tokenListModal = false;
      this.choosedToken = token;
      await this.getFees();
    },
    chooseContact: function (contact) {
      this.choosedContact = contact;
      this.inputAddress = contact.address;
      this.contactsListModal = false;
    },
    getWithdrawalTime: async function () {
      this.mainLoading = true;
      try {
        this.withdrawTime = await this.$store.dispatch("wallet/getWithdrawalProcessingTime");
      } catch (error) {
        await this.$store.dispatch("toaster/error", error.message);
      }
      this.mainLoading = false;
    },
    getFees: async function () {
      if (!this.isAddressValid || (this.choosedToken.restricted && !this.choosedFeeToken)) {
        this.feesObj = false;
        return;
      }
      this.feesLoading = true;
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
    getTimeString: function (time) {
      let { hours, minutes, seconds } = timeCalc(time);
      return `${hours ? handleTimeAmount(hours, "hour") : ""} ${minutes ? handleTimeAmount(minutes, "minute") : ""} ${seconds ? handleTimeAmount(seconds, "second") : ""}`;
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
    commitTransaction: async function () {
      try {
        utils.parseToken(this.choosedToken.symbol, this.inputTotalSum);
      } catch (error) {
        return (this.mainError = "Invalid amount inputed");
      }
      try {
        if (!this.isAddressValid) {
          throw new Error("Inputed address doesn't match ethereum address format");
        }
        this.mainError = "";
        this.mainLoading = true;
        if (!this.choosedToken) {
          throw new Error("Choose the token first");
        } else if (!this.inputTotalSum || this.inputTotalSum <= 0) {
          throw new Error("Introduce the amount");
        } else if (this.inputTotalSum > this.transactionMaxAmount) {
          throw new Error("Insufficient funds");
        } else if (!this.isAddressValid) {
          throw new Error("Destination invalid");
        } else if (this.feesLoading || !this.feesObj) {
          throw new Error("Wait until fees are loaded");
        } else if (!this.enoughTokenFee) {
          return;
        }
        await this.$store.dispatch("wallet/restoreProviderConnection");
        if (this.type === "withdraw") {
          await this.withdraw();
        } else {
          await this.transfer();
        }
      } catch (error) {
        console.log(error);
        if (error.message && error.message.includes("User denied")) {
          this.mainError = "";
        } else if (error.message && String(error.message).length < 60) {
          this.mainError = error.message;
        } else {
          this.mainError = "Transaction error";
        }
      }
      this.mainLoading = false;
      this.tip = "";
      return this.mainError === "";
    },
    withdraw: async function () {
      const syncProvider = walletData.get().syncProvider;
      this.tip = "Confirm the transaction to withdraw";
      const withdrawTransaction = await withdraw(
        this.inputAddress,
        this.choosedToken.symbol,
        this.choosedFeeToken ? this.choosedFeeToken.symbol : this.choosedToken.symbol,
        this.inputTotalSum.toString(),
        this.fastWithdraw,
        this.feesObj[this.fastWithdraw === true ? "fast" : "normal"],
      );
      this.transactionAmount = this.inputTotalSum;
      if (!Array.isArray(withdrawTransaction)) {
        this.transactionHash = withdrawTransaction.txHash;
        this.transactionFee = this.getFormattedAmount(this.choosedFeeToken ? this.choosedFeeToken.symbol : this.choosedToken.symbol, withdrawTransaction.txData.tx.fee);
        this.inputAddress = withdrawTransaction.txData.tx.to;
        this.tip = "Waiting for the transaction to be mined...";
        await withdrawTransaction.awaitReceipt();
      } else {
        this.transactionHash = withdrawTransaction[0].txHash;
        this.transactionFee = this.getFormattedAmount(this.choosedFeeToken ? this.choosedFeeToken.symbol : this.choosedToken.symbol, withdrawTransaction[1].txData.tx.fee);
        this.inputAddress = withdrawTransaction[0].txData.tx.to;
        this.tip = "Waiting for the transaction to be mined...";
        await syncProvider.notifyTransaction(withdrawTransaction[0].txHash, "COMMIT");
      }
      await this.$store.dispatch("wallet/forceRefreshData");
      this.success = true;
    },
    transfer: async function () {
      await this.getFees();
      this.tip = "Confirm the transaction to transfer";
      const transferTransaction = await transaction(
        this.inputAddress,
        this.choosedToken.symbol,
        this.choosedFeeToken ? this.choosedFeeToken.symbol : this.choosedToken.symbol,
        this.inputTotalSum.toString(),
        this.feesObj.normal.toString(),
      );
      this.transactionAmount = this.inputTotalSum;
      if (!Array.isArray(transferTransaction)) {
        this.transactionHash = transferTransaction.txHash;
        this.transactionFee = this.getFormattedAmount(this.choosedFeeToken ? this.choosedFeeToken.symbol : this.choosedToken.symbol, transferTransaction.txData.tx.fee);
        this.inputAddress = transferTransaction.txData.tx.to;
        this.tip = "Waiting for the transaction to be mined...";
        await transferTransaction.awaitReceipt();
      } else {
        this.transactionHash = transferTransaction[0].txHash;
        this.transactionFee = this.getFormattedAmount(this.choosedFeeToken ? this.choosedFeeToken.symbol : this.choosedToken.symbol, transferTransaction[1].txData.tx.fee);
        this.inputAddress = transferTransaction[0].txData.tx.to;
        this.tip = "Waiting for the transaction to be mined...";
        await transferTransaction[0].awaitReceipt();
      }
      this.tip = "Processing...";
      await this.$store.dispatch("wallet/forceRefreshData");
      this.success = true;
    },
  },
};
</script>
