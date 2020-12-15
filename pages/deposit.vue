<template>
    <div class="transactionPage">
        <i-modal v-model="cantFindTokenModal" size="md">
            <template slot="header">Can't find a token</template>
            <div>
                <p>zkSync currently supports the most popular tokens, we will be adding more over time. <a href="//zksync.io/contact.html" target="_blank" rel="noopener noreferrer">Let us know what tokens you need</a>!</p>
            </div>
        </i-modal>
        <div v-if="tokenSelectionOpened===false" class="tileBlock">
            <div class="tileHeadline h3">Deposit</div>
            <div v-if="success===true">
                <a class="_display-block _text-center" target="_blank" :href="`https://${blockExplorerLink}/tx/${transactionHash}`">Link to the transaction <i class="fas fa-external-link"></i></a>
                <checkmark />
                <p class="_text-center _margin-top-0">Your deposit tx has been mined and will be processed after 1 confirmations. Use the link below to track the progress.</p>
                <div class="totalAmount _margin-top-2">
                    <div class="headline">Amount:</div>
                    <div class="amount">{{choosedToken.symbol}} {{formatMax(transactionAmount)}} <span class="totalPrice">~${{(transactionAmount*choosedToken.price).toFixed(2)}}</span></div>
                </div>
                <i-button block size="lg" variant="secondary" class="_margin-top-1" to="/account">Ok</i-button>
            </div>
            <div v-else-if="loading===false">
                <div class="_padding-bottom-1">Amount / asset</div>
                <i-input v-model="inputTotalSum" size="lg" placeholder="0.00" type="number">
                    <i-button v-if="!choosedToken" slot="append" block link variant="secondary" @click="tokenSelectionOpened=true">Select token</i-button>
                    <i-button v-else slot="append" class="selectedTokenBtn" block link variant="secondary" @click="tokenSelectionOpened=true">{{choosedToken.symbol}}&nbsp;&nbsp;<i class="far fa-angle-down"></i></i-button>
                </i-input>
                <div v-if="choosedToken" class="_display-flex _justify-content-space-between _margin-top-1">
                    <div class="totalPrice">~${{(inputTotalSum*choosedToken.price).toFixed(2)}}</div>
                    <div class="maxAmount" @click="inputTotalSum=transactionMaxAmount>0?transactionMaxAmount:0">Max: {{transactionMaxAmount>0?transactionMaxAmount:0}}</div>
                </div>
                <div v-if="choosedToken && choosedToken.unlocked===true && inputTotalSum>transactionMaxAmount" class="errorText _text-center _margin-top-1">
                    Not enough {{choosedToken.symbol}} to perform a transaction
                </div>
                <div v-if="choosedToken && choosedToken.unlocked===false" class="tokenLocked">
                    <p class="_text-center">You should firstly unlock selected token in order to authorize deposits for <b>{{choosedToken.symbol}}</b></p>
                    <i-button block size="lg" variant="secondary" class="_margin-top-1" @click="unlockToken()"><i class="far fa-lock-open-alt"></i> Unlock</i-button>
                </div>
                <i-button v-else block size="lg" variant="secondary" class="_margin-top-1" :disabled="!inputTotalSum || inputTotalSum>transactionMaxAmount" @click="deposit()">Deposit</i-button>
            </div>
            <div v-else class="nothingFound _margin-top-1 _padding-bottom-1">
                <p v-if="tip" class="_display-block _text-center">{{tip}}</p>
                <i-loader class="_display-block _margin-top-1" size="md" :variant="$inkline.config.variant === 'light' ? 'dark' : 'light'" />
            </div>
        </div>
        <div v-else class="tileBlock tokensTile">
            <div class="tileHeadline h3">
                <span>Balances in L1</span>
                <i-tooltip>
                    <i class="fas fa-times" @click="tokenSelectionOpened=false"></i>
                    <template slot="body">Close</template>
                </i-tooltip>
            </div>
            <div v-if="loading===true" class="nothingFound">
                <i-loader size="md" :variant="$inkline.config.variant === 'light' ? 'dark' : 'light'" />
            </div>
            <template v-else>
                <i-input v-model="search" placeholder="Filter balances in L1" maxlength="10">
                    <i slot="prefix" class="far fa-search"></i>
                </i-input>
                <div class="tokenListContainer">
                    <div v-for="item in displayedTokenList" :key="item.symbol" class="tokenItem" @click="chooseToken(item)">
                        <div class="tokenLabel">{{item.symbol}}</div>
                        <div class="rightSide">
                            <div class="balance">{{item.balance}}</div>
                        </div>
                    </div>
                    <div v-if="search && displayedTokenList.length===0" class="nothingFound">
                        <span>Your search <b>"{{search}}"</b> did not match any tokens</span>
                    </div>
                </div>
                <i-button block link size="lg" variant="secondary" class="_margin-top-1" @click="cantFindTokenModal=true">Can't find a token?</i-button>
            </template>
        </div>
    </div>
</template>

<script>
import walletData from "@/plugins/walletData.js";
import handleFormatToken from "@/plugins/handleFormatToken.js";
import { ethers } from "ethers";
import * as zksync from "zksync";
import Checkmark from "@/components/Checkmark.vue";
export default {
  components: {
    Checkmark,
  },
  data() {
    return {
      search: "",
      inputTotalSum: null,
      tokenSelectionOpened: false,
      loading: false,
      tip: "",
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
      return this.formatMax(this.choosedToken.balance - this.choosedToken.fee);
    },
    blockExplorerLink: function () {
      return process.env.APP_ETH_BLOCK_EXPLORER;
    },
  },
  watch: {
    async tokenSelectionOpened(val) {
      if (val === true && this.loading === false) {
        this.loading = true;
        try {
          /* const balance = await walletData.get().syncWallet.getEthereumBalance("ETH");
                    console.log(balance);
                    return; */
          const list = await this.$store.dispatch("wallet/getInitialBalances");
          this.tokensList = list.map((e) => ({ ...e, balance: this.formatMax(e.balance) }));
        } catch (error) {
          console.log(error);
        }
        this.loading = false;
      }
    },
  },
  methods: {
    formatMax: function (val) {
      val = val.toString();
      let parts = val.split(".");
      if (parts.length > 1) {
        if (parts[1].length > 8) {
          parts[1] = parts[1].substr(0, 8);
        }
      }
      return parseFloat(parts.join("."));
    },
    chooseToken: async function (token) {
      this.loading = true;
      if (typeof token.unlocked === "undefined") {
        token.unlocked = await this.checkTokenState(token);
      }
      if (typeof token.price === "undefined") {
        token.price = await this.$store.dispatch("wallet/getTokenPrice", token.symbol);
      }
      if (typeof token.fee === "undefined") {
        /* const wallet = walletData.get().syncWallet;
                const syncProvider = walletData.get().syncProvider;
                const foundFee = await syncProvider.getTransactionFee("Transfer", wallet.address(), token.symbol);
                token.fee = parseFloat(handleFormatToken(token.symbol, foundFee.totalFee));
                token.feeObj = foundFee.totalFee; */
        token.fee = 0.0002;
      }
      this.choosedToken = token;
      this.loading = false;
      this.tokenSelectionOpened = false;
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
      if (!this.choosedToken || !this.inputTotalSum) {
        return;
      }
      this.loading = true;
      try {
        const wallet = walletData.get().syncWallet;
        this.tip = "Confirm the transaction to deposit";
        const depositResponse = await wallet.depositToSyncFromEthereum({
          depositTo: wallet.address(),
          token: this.choosedToken.symbol,
          amount: ethers.BigNumber.from(
            (await zksync.closestPackableTransactionAmount(wallet.provider.tokenSet.parseToken(this.choosedToken.symbol, this.inputTotalSum.toString()))).toString(),
          ),
          ethTxOptions: {
            gasLimit: "200000",
          },
        });
        /* console.log('depositResponse', depositResponse); */
        this.transactionAmount = this.inputTotalSum;
        this.tip = "Waiting for the transaction to be mined...";
        const awaitEthereumTxCommit = await depositResponse.awaitEthereumTxCommit();
        /* console.log('awaitEthereumTxCommit', awaitEthereumTxCommit); */
        this.transactionHash = depositResponse.ethTx.hash;
        this.tip = "Processing...";
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 5000);
        });
        await this.$store.dispatch("wallet/getInitialBalances", true).catch((err) => {
          console.log("getInitialBalances", err);
        });
        await this.$store.dispatch("wallet/getzkBalances", undefined, true).catch((err) => {
          console.log("getzkBalances", err);
        });
        await this.$store.dispatch("wallet/getTransactionsHistory", { force: true }).catch((err) => {
          console.log("getTransactionsHistory", err);
        });
        this.tip = "";
        this.inputTotalSum = null;
        this.success = true;
      } catch (error) {
        this.tip = "";
        console.log("Deposit error", error);
      }
      this.loading = false;
    },
  },
};
</script>
