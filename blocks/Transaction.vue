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
    <i-modal v-model="saveContactModal" size="md">
      <template slot="header">Save contact</template>
      <div>
        <div class="_padding-bottom-1">Contact name</div>
        <i-input v-model="saveContactInput" size="lg" placeholder="Name" maxlength="20"/>
        <div v-if="saveContactModalError" class="modalError _margin-top-1">{{ saveContactModalError }}</div>
        <i-button class="_margin-top-1" block variant="secondary" size="lg" @click="saveContact()">Save</i-button>
      </div>
    </i-modal>
    <account-unlock v-if="isAccountLocked && openedTab!=='tokenList'" :choosed-token="choosedToken"
                    @selectToken="openedTab='tokenList'"/>
    <div v-else-if="success===true" class="tileBlock">
      <div class="tileHeadline h3">
        <span>{{ type==='withdraw' ? 'Withdraw':'Transfer' }}</span>
      </div>
      <a class="_display-block _text-center" target="_blank"
         :href="`https://${blockExplorerLink}/transactions/${transactionHash}`">Link to the transaction <i
          class="fas fa-external-link"></i></a>
      <checkmark/>
      <p class="_text-center _margin-top-0">Your {{ type==='withdraw' ? 'withdrawal':'transaction' }} will be processed
        shortly. Use the link below to track the progress.</p>
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
        <div class="amount">{{ choosedToken.symbol }} {{ formatMax(transactionAmount) }} <span
            class="totalPrice">~${{ (transactionAmount * choosedToken.tokenPrice).toFixed(2) }}</span></div>
      </div>
      <div class="totalAmount smaller _margin-top-1">
        <div class="headline">Fee:</div>
        <div class="amount">{{ choosedToken.symbol }} {{ formatMax(transactionFee) }} <span
            class="totalPrice">~${{ (transactionFee * choosedToken.tokenPrice).toFixed(2) }}</span></div>
      </div>
      <i-button block size="lg" variant="secondary" class="_margin-top-2" to="/account">Ok</i-button>
    </div>
    <div v-else-if="mainLoading===true" class="tileBlock">
      <div class="tileHeadline h3">{{ type==='withdraw' ? 'Withdraw':'Transfer' }}</div>
      <p v-if="openedTab==='main' && tip" class="_display-block _text-center _margin-top-1">{{ tip }}</p>
      <div v-if="mainLoading===true" class="nothingFound _padding-y-2">
        <i-loader size="md" :variant="$inkline.config.variant === 'light' ? 'dark' : 'light'"/>
      </div>
    </div>
    <div v-else-if="openedTab==='main'" class="tileBlock">
      <div class="tileHeadline h3">{{ type==='withdraw' ? 'Withdraw':'Transfer' }}</div>

      <div class="_padding-bottom-1">Address</div>
      <i-input v-model="inputAddress" size="lg" placeholder="0x address" maxlength="42"/>
      <i-row class="_margin-top-1">
        <i-column v-if="!choosedContact && !isOwnAddress" xs="12" :md="canSaveContact?7:12">
          <i-button block link variant="secondary" @click="openedTab='contactsList'">Select from contacts</i-button>
        </i-column>
        <i-column v-else xs="12" :md="canSaveContact?7:12">
          <i-button block link variant="secondary" @click="openedTab='contactsList'">
            {{ isOwnAddress ? 'Own account':choosedContact.name }}&nbsp;&nbsp;<i class="far fa-angle-down"></i>
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
      <i-input v-model="inputTotalSum" size="lg" placeholder="0.00" type="number">
        <i-button v-if="!choosedToken" slot="append" block link variant="secondary" @click="openedTab='tokenList'">
          Select token
        </i-button>
        <i-button v-else slot="append" class="selectedTokenBtn" block link variant="secondary"
                  @click="openedTab='tokenList'">{{ choosedToken.symbol }}&nbsp;&nbsp;<i class="far fa-angle-down"></i>
        </i-button>
      </i-input>
      <div v-if="choosedToken" class="_display-flex _justify-content-space-between _margin-top-1">
        <div class="totalPrice">~${{ (inputTotalSum * choosedToken.tokenPrice).toFixed(2) }}</div>
        <div class="maxAmount" @click="inputTotalSum=transactionMaxAmount>0?transactionMaxAmount:0">Max:
          {{ transactionMaxAmount > 0 ? transactionMaxAmount:0 }}
        </div>
      </div>
      <div v-if="choosedToken && inputTotalSum>transactionMaxAmount" class="errorText _text-center _margin-top-1">
        Not enough {{ choosedToken.symbol }} to perform a transaction
      </div>

      <i-radio-group v-if="choosedToken && type==='withdraw'" v-model="fastWithdraw" class="_margin-top-2">
        <i-radio :value="false">Normal withdraw (Fee: {{ feesObj.normal }} {{ choosedToken.symbol }}).<br>Processing
          time: {{ getTimeString(withdrawTime.normal) }}
        </i-radio>
        <i-radio :value="true">Fast withdraw (Fee: {{ feesObj.fast }} {{ choosedToken.symbol }}).<br>Processing time:
          {{ getTimeString(withdrawTime.fast) }}
        </i-radio>
      </i-radio-group>

      <div v-if="mainError" class="errorText _text-center _margin-top-1">{{ mainError }}</div>

      <i-button block size="lg" variant="secondary" class="_margin-top-1"
                :disabled="!inputTotalSum || !choosedToken || inputTotalSum>transactionMaxAmount"
                @click="commitTransaction()">{{ type==='withdraw' ? 'Withdraw':'Transfer' }}
      </i-button>
      <div v-if="feesObj && choosedToken && isAddressValid" class="_text-center _margin-top-1">
        Fee:
        <span v-if="feesLoading" class="totalPrice">Loading...</span>
        <span v-else>{{ feesObj[fastWithdraw===true ? 'fast':'normal'] }} {{ choosedToken.symbol }} <span
            class="totalPrice">~${{
            (feesObj[fastWithdraw===true ? 'fast':'normal'] * choosedToken.tokenPrice).toFixed(2)
          }}</span></span>
      </div>

    </div>
    <div v-else-if="openedTab==='tokenList'" class="tileBlock tokensTile">
      <div class="tileHeadline h3">
        <span>Balances in L2</span>
        <i-tooltip>
          <i class="fas fa-times" @click="openedTab='main'"></i>
          <template slot="body">Close</template>
        </i-tooltip>
      </div>
      <div v-if="tokensLoading===true" class="nothingFound">
        <i-loader size="md" :variant="$inkline.config.variant === 'light' ? 'dark' : 'light'"/>
      </div>
      <template v-else>
        <i-input v-model="tokenSearch" placeholder="Filter balances in L2" maxlength="10">
          <i slot="prefix" class="far fa-search"></i>
        </i-input>
        <div class="tokenListContainer">
          <div v-for="item in displayedTokenList" :key="item.symbol" class="tokenItem" @click="chooseToken(item)">
            <div class="tokenLabel">{{ item.symbol }}</div>
            <div class="rightSide">
              <div class="balance">{{ item.balance }}</div>
            </div>
          </div>
          <div v-if="tokenSearch && displayedTokenList.length===0" class="nothingFound">
            <span>Your search <b>"{{ tokenSearch }}"</b> did not match any tokens</span>
          </div>
          <div v-else-if="displayedTokenList.length===0" class="nothingFound">
            <span>No balances yet. Please make a deposit or request money from someone!</span>
          </div>
        </div>
        <i-button block link size="lg" variant="secondary" class="_margin-top-1" @click="cantFindTokenModal=true">Can't
          find a token?
        </i-button>
      </template>
    </div>
    <div v-else-if="openedTab==='contactsList'" class="tileBlock contactTile">
      <div class="tileHeadline h3">
        <span>Contacts</span>
        <i-tooltip>
          <i class="fas fa-times" @click="openedTab='main'"></i>
          <template slot="body">Close</template>
        </i-tooltip>
      </div>
      <i-input v-if="contactSearch.trim() || displayedContactsList.length!==0" v-model="contactSearch"
               placeholder="Filter contacts" maxlength="20">
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
              <div class="contactAddress">{{ ownAddress }}</div>
            </div>
          </div>
          <div v-for="(item, index) in displayedContactsList" :key="index" class="contactItem"
               @click.self="chooseContact(item)">
            <user-img :wallet="item.address"/>
            <div class="contactInfo">
              <div class="contactName">{{ item.name }}</div>
              <div class="contactAddress">{{ item.address }}</div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import AccountUnlock from "@/blocks/AccountUnlock.vue";
import Checkmark from "@/components/Checkmark.vue";

import userImg from "@/components/userImg.vue";
import walletAddress from "@/components/walletAddress.vue";
import handleExponentialNumber from "@/plugins/handleExponentialNumbers.js";
import handleFormatToken from "@/plugins/handleFormatToken.js";
import validations from "@/plugins/validations.js";

import walletData from "@/plugins/walletData.js";
import { ethers } from "ethers";
import { transaction } from "~/middleware/walletActions/transaction";

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
  },
  props: {
    type: {
      type: String,
      default: "",
      required: true,
    },
  },
  data() {
    return {
      openedTab: "main",

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
      tokensLoading: false,
      choosedToken: false,
      cantFindTokenModal: false,

      tip: "",
      success: false,
      transactionHash: "",
      transactionAmount: null,
      transactionFee: null,
    };
  },
  computed: {
    isAccountLocked: function () {
      return this.$store.getters["wallet/isAccountLocked"];
    },
    displayedTokenList: function () {
      if (!this.tokenSearch.trim()) {
        return this.tokensList;
      }
      return this.tokensList.filter((e) => e.balance > 0 && e.symbol.toLowerCase().includes(this.tokenSearch.trim().toLowerCase()));
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
    canSaveContact: function () {
      let isInContactList = false;
      for (const item of this.contactsList) {
        if (item.address === this.inputAddress) {
          this.choosedContact = item;
          isInContactList = true;
          break;
        }
      }
      if (!isInContactList) {
        this.choosedContact = false;
      }
      return !isInContactList && !this.isOwnAddress && !this.choosedContact && this.isAddressValid;
    },
    isOwnAddress: function () {
      return this.inputAddress.toLowerCase() === walletData.get().syncWallet.address().toLowerCase();
    },
    ownAddress: function () {
      return walletData.get().syncWallet.address();
    },
    transactionMaxAmount: function () {
      return this.formatMax(this.choosedToken.balance - (this.fastWithdraw === true ? this.feesObj.fast : this.feesObj.normal));
    },
    blockExplorerLink: function () {
      return process.env.APP_ZKSYNC_BLOCK_EXPLORER;
    },
  },
  watch: {
    async openedTab(val) {
      if (val === "tokenList" && this.tokensLoading === false) {
        this.tokensLoading = true;
        try {
          const list = await this.$store.dispatch("wallet/getzkBalances");
          this.tokensList = list.map((e) => ({ ...e, balance: this.formatMax(e.balance) }));
        } catch (error) {
          console.log(error);
        }
        this.tokensLoading = false;
      }
    },
    inputAddress() {
      if (this.isAddressValid) {
        this.getFees();
      }
    },
  },
  mounted() {
    this.getContactsList();
    if (this.type === "withdraw") {
      this.getWidthdrawTime();
    } else {
      this.mainLoading = false;
    }
  },
  methods: {
    getFormatedAmount: function (token, amount) {
      return handleExponentialNumber(+handleFormatToken(token, +amount));
    },
    formatMax: function (val) {
      if (val === undefined) {
        return 0;
      }
      val = String(val).toString();
      let parts = val.split(".");
      if (parts.length > 1) {
        if (parts[1].length > 8) {
          parts[1] = parts[1].substr(0, 8);
        }
      }
      return parseFloat(parts.join("."));
    },
    chooseToken: async function (token) {
      this.tokensLoading = true;
      this.choosedToken = token;
      await this.getFees();
      this.tokensLoading = false;
      this.openedTab = "main";
    },
    chooseContact: function (contact) {
      this.choosedContact = contact;
      this.inputAddress = contact.address;
      this.openedTab = "main";
    },
    getWidthdrawTime: async function () {
      this.mainLoading = true;
      this.withdrawTime = await this.$store.dispatch("wallet/getWithdrawalProcessingTime");
      this.mainLoading = false;
    },
    getFees: async function () {
      if (!this.isAddressValid) {
        this.feesObj = false;
        return;
      }
      this.feesLoading = true;
      const tokenSymbol = this.choosedToken ? this.choosedToken.symbol : "ETH";
      this.feesObj = await this.$store.dispatch("wallet/getFees", {
        address: this.inputAddress,
        symbol: tokenSymbol,
        type: this.type,
      });
      this.feesLoading = false;
    },
    getTimeString: function (time) {
      let { hours, minutes, seconds } = timeCalc(time);
      return `${hours ? handleTimeAmount(hours, "hour") : ""} ${minutes ? handleTimeAmount(minutes, "minute") : ""} ${seconds ? handleTimeAmount(seconds, "second") : ""}`;
    },
    getContactsList: function () {
      try {
        const walletAddress = walletData.get().syncWallet.address();
        if (window.localStorage.getItem("contacts-" + walletAddress)) {
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
        window.localStorage.setItem("contacts-" + walletData.get().syncWallet.address(), JSON.stringify(this.contactsList));
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
        if (!this.isAddressValid) {
          throw new Error("Inputed address doesn't match ethereum address format");
        }
        this.mainError = "";
        this.mainLoading = true;
        if (!this.inputTotalSum) {
          throw new Error("Introduce the amount");
        }
        if (!this.choosedToken) {
          throw new Error("Choose the token first");
        }
        if (this.inputTotalSum > this.transactionMaxAmount) {
          throw new Error("Insufficient funds");
        }
        if (!this.isAddressValid) {
          throw new Error("Destination invalid");
        }
        if (!walletData.get().syncProvider.transport.ws.isOpened) {
          await walletData.get().syncProvider.transport.ws.open();
        }
        if (this.type === "withdraw") {
          await this.withdraw();
        } else {
          await this.transfer();
        }
      } catch (error) {
        if (error.message || !error.message.includes("User denied")) {
          this.mainError = error.message;
        } else {
          this.mainError = "Transaction error";
        }
      }
      this.mainLoading = false;
      this.tip = "";
      return this.mainError === "";
    },
    withdraw: async function (syncWallet, syncProvider) {
      await this.$store.dispatch("wallet/walletRefresh");
      const fee = await syncProvider.getTransactionFee(this.fastWithdraw ? "FastWithdraw" : "Withdraw", this.inputAddress, this.choosedToken.symbol);
      this.tip = "Confirm the transaction to withdraw";
      const withdrawTransaction = await syncWallet.withdrawFromSyncToEthereum({
        ethAddress: this.inputAddress,
        feeToken: this.choosedToken.symbol,
        token: this.choosedToken.symbol,
        amount: ethers.BigNumber.from(
          (await zksync.closestPackableTransactionAmount(syncWallet.provider.tokenSet.parseToken(this.choosedToken.symbol, this.inputTotalSum.toString()))).toString(),
        ),
        fee: zksync.closestPackableTransactionFee(fee.totalFee),
        fastProcessing: this.fastWithdraw,
      });
      console.log("withdrawTransaction", withdrawTransaction);
      this.transactionAmount = parseFloat(this.inputTotalSum);
      this.transactionHash = withdrawTransaction.txHash;
      this.transactionFee = this.getFormatedAmount(this.choosedToken.symbol, withdrawTransaction.txData.tx.fee);
      this.inputAddress = withdrawTransaction.txData.tx.to;
      this.tip = "Waiting for the transaction to be mined...";
      const receipt = await withdrawTransaction.awaitReceipt();
      console.log("receipt", receipt);
      await this.$store.dispatch("wallet/getInitialBalances", true).catch((err) => {
        console.log("getInitialBalances", err);
      });
      await this.$store.dispatch("wallet/getzkBalances", { accountState: undefined, force: true }).catch((err) => {
        console.log("getzkBalances", err);
      });
      await this.$store.dispatch("wallet/getTransactionsHistory", { force: true }).catch((err) => {
        console.log("getTransactionsHistory", err);
      });
      this.success = true;
    },
    transfer: async function () {
      await this.$store.dispatch("wallet/walletRefresh");
      await this.getFees();
      this.tip = "Confirm the transaction to transfer";
      const transferTransaction = await transaction(
        this.inputAddress,
        this.choosedToken.symbol,
        this.choosedToken.symbol,
        this.inputTotalSum.toString(),
        this.feesObj.normal.toString(),
      );

      // // if (receipt) store.txButtonUnlocked = true;
      // const verifyReceipt = await transferTransaction.awaitVerifyReceipt();
      // console.log(verifyReceipt);
      // store.verifyToken = !!verifyReceipt;

      this.transactionAmount = parseFloat(this.inputTotalSum);
      this.transactionHash = transferTransaction.txHash;
      this.transactionFee = this.getFormatedAmount(this.choosedToken.symbol, transferTransaction.txData.tx.fee);
      this.inputAddress = transferTransaction.txData.tx.to;
      this.tip = "Waiting for the transaction to be mined...";
      await transferTransaction.awaitReceipt();
      this.tip = "Processing...";
      await this.$store.dispatch("wallet/getInitialBalances", true).catch((err) => {
        console.log("getInitialBalances", err);
      });
      await this.$store.dispatch("wallet/getzkBalances", { accountState: undefined, force: true }).catch((err) => {
        console.log("getzkBalances", err);
      });
      await this.$store.dispatch("wallet/getTransactionsHistory", { force: true }).catch((err) => {
        console.log("getTransactionsHistory", err);
      });
      this.success = true;
    },
  },
};
</script>
