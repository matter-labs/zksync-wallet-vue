<template>
  <div class="transactionPage">
    <i-modal v-model="cantFindTokenModal" size="md">
      <template slot="header">Can't find a token</template>
      <div>
        <p>
          zkSync currently supports the most popular tokens, we will be adding more over time.
          <a href="//zksync.io/contact.html" target="_blank" rel="noopener noreferrer">Let us know what tokens you need</a>!
        </p>
      </div>
    </i-modal>
    <div class="tileBlock">
      <div class="tileHeadline h3" :class="{'withBtn': (loading===false || tokenSelectionOpened===true)}">
        <nuxt-link v-if="loading===false" :to="(fromRoute && fromRoute.fullPath!==$route.fullPath)?fromRoute:'/account'" class="returnBtn">
          <i class="far fa-long-arrow-alt-left"></i>
        </nuxt-link>
        <div>
          Deposit
        </div>
      </div>
      <div v-if="success===true">
        <checkmark/>
        <p class="_text-center _margin-top-0">
          Your deposit tx has been mined and will be processed after required number of confirmations. Use the transaction link to track the progress.
        </p>
        <a class="_display-block _text-center _margin-top-1" target="_blank" :href="`${blockExplorerLink}/tx/${transactionHash}`">
          Link to the transaction&nbsp;<i class="fas fa-external-link"></i>
        </a>
        <div class="totalAmount _margin-top-2">
          <div class="headline">Amount:</div>
          <div class="amount">
            <span class="tokenSymbol">{{ choosedToken.symbol }}</span> {{ transactionAmount }}
            <span class="totalPrice">{{ inputTotalSumBigNumber |formatUsdAmount( choosedToken.price, choosedToken.symbol) }}</span>
          </div>
        </div>
        <i-button block size="lg" variant="secondary" class="_margin-top-1" to="/account">Ok</i-button>
      </div>
      <div v-else-if="loading===false || tokenSelectionOpened===true">
        <div class="_padding-bottom-1">Amount / asset</div>
        <div>
          <i-input v-model="inputTotalSum" size="lg" lang="en-US" type="number" @keyup.enter="deposit()">
            <i-button v-if="!choosedToken" slot="append" block link variant="secondary" @click="openTokenSelection()">
              Select token
            </i-button>
            <i-button v-else slot="append" class="selectedTokenBtn" block link variant="secondary" @click="openTokenSelection()">
              <span class="tokenSymbol">{{ choosedToken.symbol }}</span>&nbsp;&nbsp;<i class="far fa-angle-down"/>
            </i-button>
          </i-input>
        </div>
        <div v-if="choosedToken" class="_display-flex _justify-content-space-between _margin-top-1">
          <div class="totalPrice">{{ inputTotalSumBigNumber | formatUsdAmount(choosedToken.price, choosedToken.symbol) }}</div>
          <div class="maxAmount" @click="handleMaxAmountClick()">
            Max: {{ transactionMaxAmount | formatToken(choosedToken.symbol) }}
          </div>
        </div>
        <div v-if="choosedToken && choosedToken.unlocked===false" class="tokenLocked">
          <p class="_text-center">
            You should firstly unlock selected token in order to authorize deposits for
            <span class="tokenSymbol">{{ choosedToken.symbol }}</span>
          </p>
          <i-button block size="lg" variant="secondary" class="_margin-top-1" @click="unlockToken()">
            <i class="far fa-lock-open-alt"/>&nbsp;Unlock
          </i-button>
        </div>
        <div v-else-if="choosedToken && choosedToken.unlocked===true && inputTotalSum>transactionMaxAmount"
             class="errorText _text-center _margin-top-1">
          Not enough <span class="tokenSymbol">{{ choosedToken.symbol }}</span> to perform a transaction
        </div>
        <div v-if="mainError" class="errorText _text-center _margin-top-1">{{ mainError }}</div>
        <i-button
            v-if="choosedToken && choosedToken.unlocked === true"
            :disabled="!depositAllowed"
            block size="lg" variant="secondary" class="_margin-top-1" @click="deposit()">
          Deposit
        </i-button>
      </div>
      <div v-else class="nothingFound _margin-top-1 _padding-bottom-1">
        <a v-if="transactionHash"
           class="_display-block _text-center"
           target="_blank"
           :href="`${blockExplorerLink}/tx/${transactionHash}`">Link to the transaction <i class="fas fa-external-link"></i></a>
        <p v-if="tip" class="_display-block _text-center">{{ tip }}</p>
        <loader class="_display-block _margin-top-1"/>
      </div>
    </div>
    <i-modal v-model="tokenSelectionOpened" size="md">
      <template slot="header">Balances in L1</template>
      <div>
        <i-input v-model="search" placeholder="Filter balances in L1" maxlength="10">
          <i slot="prefix" class="far fa-search"/>
        </i-input>
        <div class="tokenListContainer">
          <div v-for="item in displayedTokenList" :key="item.symbol" class="tokenItem" @click="chooseToken(item)">
            <div class="tokenSymbol">{{ item.symbol }}</div>
            <div class="rightSide">
              <div class="balance">{{ item.balance | formatToken(item.symbol) }}</div>
            </div>
          </div>
          <div v-if="search && displayedTokenList.length===0" class="nothingFound">
            <span>Your search <b>"{{ search }}"</b> did not match any tokens</span>
          </div>
        </div>
        <i-button block link size="lg" variant="secondary" class="_margin-top-1" @click="tokenSelectionOpened=false;cantFindTokenModal=true">
          Can't find a token?
        </i-button>
      </div>
    </i-modal>
  </div>
</template>

<script>
import Checkmark from "@/components/Checkmark.vue";
import { APP_ETH_BLOCK_EXPLORER } from "@/plugins/build";
import utils from "@/plugins/utils.js";
import { walletData } from "@/plugins/walletData.js";

export default {
  components: {
    Checkmark,
  },
  asyncData({ from }) {
    return {
      fromRoute: from,
    };
  },
  data() {
    return {
      depositAllowed: false,
      decimalPrecision: 18,

      zksync: null,
      search: "",
      inputTotalSumBigNumber: null,
      inputTotalSum: null,
      tokenSelectionOpened: false,
      loading: true,
      tip: "",
      mainError: "",
      tokensList: [],
      choosedToken: false,
      cantFindTokenModal: false,
      success: false,
      transactionHash: "",
      transactionAmount: "",
    };
  },
  computed: {
    displayedTokenList: function () {
      if (!this.search.trim()) {
        return this.tokensList;
      }
      return this.tokensList.filter((e) => e.symbol.toLowerCase().includes(this.search.trim().toLowerCase()));
    },
    transactionMaxAmount: function () {
      return this.zksync.closestPackableTransactionAmount(this.choosedToken.balance);
    },
    blockExplorerLink: function () {
      return APP_ETH_BLOCK_EXPLORER;
    },
  },
  watch: {
    /**
     * @param incomingValue
     */
    async inputTotalSum(incomingValue) {
      this.mainError = "";

      /**
       * Validation launch
       */
      const validationResults = await this.isDepositEnabled(incomingValue);
      if (validationResults === true) {
        this.inputTotalSum = incomingValue;
        this.inputTotalSumBigNumber = utils.parseToken(this.choosedToken.symbol, incomingValue);
      }
    },
  },
  async mounted() {
    this.zksync = await walletData.zkSync();
    this.loading = false;
  },
  methods: {
    updateDecimals: async function () {
      const decimals = await this.$store.dispatch("tokens/getTokenDecimals", this.choosedToken.symbol);
      this.decimalPrecision = this.choosedToken && decimals ? decimals : 18;
    },

    /**
     * All validation focused inside this method
     * @param {string|*} incomingValue
     * @return {Promise<boolean>}
     */
    isDepositEnabled: async function (incomingValue = null) {
      if (!this.choosedToken) {
        this.mainError = "";
        return (this.depositAllowed = false);
      }

      let userAmount = this.inputTotalSum;
      let userAmountBigNum = null;
      if (incomingValue !== null) {
        userAmount = incomingValue;
      }

      await this.updateDecimals();

      if (!utils.isDecimalsValid(this.choosedToken.symbol, userAmount, this.decimalPrecision)) {
        this.mainError = `Amount out of range, ${this.choosedToken.symbol} allows ${this.decimalPrecision} decimal digits max`;
        return (this.depositAllowed = false);
      }

      try {
        userAmountBigNum = utils.parseToken(this.choosedToken.symbol, userAmount);
      } catch (error) {
        if (error.message && error.message.search("fractional component exceeds decimals") !== -1) {
          this.mainError = `Introduced amount is out of range. Note: ${this.choosedToken.symbol} allows ${this.decimalPrecision} decimal digits max`;
          return (this.depositAllowed = false);
        } else {
          this.mainError = `Amount processing error. Common reason behind it — inaccurate amount.
          Try again paying attention to the decimal amount number format — it should help`;
          return (this.depositAllowed = false);
        }
      }
      if (!userAmountBigNum || !userAmountBigNum._isBigNumber) {
        this.setMainError = `Amount processing error. Common reason behind it — inaccurate amount.
          Try again paying attention to the decimal amount number format — it should help`;
        return (this.depositAllowed = false);
      }

      if (userAmountBigNum.lte(0)) {
        this.mainError = "";
        return (this.depositAllowed = false);
      }
      if (userAmountBigNum.gt(this.transactionMaxAmount)) {
        this.mainError = `Not enough ${this.choosedToken.symbol} to perform a deposit`;
        return (this.depositAllowed = false);
      }

      this.setMainError = "";
      return (this.depositAllowed = true);
    },
    handleMaxAmountClick: function () {
      this.inputTotalSum = utils.handleFormatToken(this.choosedToken.symbol, this.transactionMaxAmount);
    },
    openTokenSelection: async function () {
      this.loading = true;
      try {
        const list = await this.$store.dispatch("wallet/getInitialBalances");
        this.tokensList = list.map((e) => ({ ...e, balance: e.balance }));
        this.tokenSelectionOpened = true;
      } catch (error) {
        await this.$store.dispatch("toaster/error", error.message);
      }
      this.loading = false;
    },
    chooseToken: async function (token) {
      await this.updateDecimals();
      this.tokenSelectionOpened = false;
      this.loading = true;
      if (typeof token.unlocked === "undefined") {
        token.unlocked = await this.checkTokenState(token);
      }
      if (typeof token.price === "undefined") {
        token.price = await this.$store.dispatch("tokens/getTokenPrice", token.symbol);
      }
      /* if (typeof token.fee === "undefined") {
       console.log(`typeof token.fee === "undefined". token.fee = 0.0002`);
       token.fee = 0.0002;
       } */
      this.mainError = "";
      this.choosedToken = token;
      this.loading = false;
    },
    unlockToken: async function () {
      this.loading = true;
      try {
        const wallet = walletData.get().syncWallet;
        this.tip = "Confirm the transaction in order to unlock the token";
        const approveDeposits = await wallet.approveERC20TokenDeposits(this.choosedToken.address);
        this.tip = "Waiting for the transaction to be processed...";
        const waitResult = await approveDeposits.wait();
        this.tip = "";
        const isTokenUnlocked = await this.checkTokenState(this.choosedToken);
        this.choosedToken = { ...this.choosedToken, unlocked: isTokenUnlocked };
      } catch (error) {
        this.mainError = error.message;
        this.tip = "";
        console.log(error);
      }
      this.loading = false;
    },
    checkTokenState: async function (token) {
      if (token.symbol !== "ETH") {
        const wallet = walletData.get().syncWallet;
        const isApprovedDeposits = await wallet.isERC20DepositsApproved(token.address);
        this.saveUnlockedTokenState(token.symbol, !!isApprovedDeposits);
        return !!isApprovedDeposits;
      } else {
        this.saveUnlockedTokenState(token.symbol, true);
        return true;
      }
    },
    saveUnlockedTokenState: function (tokenSymbol, state) {
      for (const item of this.tokensList) {
        if (item.symbol === tokenSymbol) {
          item.unlocked = state;
        }
      }
    },
    deposit: async function () {
      try {
        utils.parseToken(this.choosedToken.symbol, this.inputTotalSum.toString());
      } catch (error) {
        return (this.mainError =
          "Amount processing error. Common reason behind it — inaccurate amount. Try again paying attention to the decimal amount number format — it should help");
      }

      try {
        const validationStatus = await this.isDepositEnabled();
        if (!validationStatus) {
          return;
        }
        this.loading = true;

        const wallet = walletData.get().syncWallet;
        this.tip = "Confirm the transaction to deposit";
        const depositResponse = await wallet.depositToSyncFromEthereum({
          depositTo: wallet.address(),
          token: this.choosedToken.symbol,
          amount: this.inputTotalSumBigNumber,
          /* ethTxOptions: {
           gasLimit: "200000",
           }, */
        });
        this.transactionAmount = this.inputTotalSum;
        this.transactionHash = depositResponse.ethTx.hash;
        this.tip = "Waiting for the transaction to be mined...";
        const awaitEthereumTxCommit = await depositResponse.awaitEthereumTxCommit();
        this.tip = "Processing...";
        await this.$store.dispatch("wallet/forceRefreshData");
        this.tip = "";
        this.inputTotalSum = null;
        this.success = true;
      } catch (error) {
        this.tip = "";
        if (error.message && error.message.includes("User denied")) {
          this.mainError = "";
        } else if (error.message && String(error.message).length < 60) {
          this.mainError = error.message;
        } else {
          this.mainError = "Transaction error";
        }
      }
      this.loading = false;
    },
  },
};
</script>
