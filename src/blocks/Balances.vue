<template>
  <div>
    <i-modal v-model="balanceInfoModal" size="md">
      <template slot="header">Balances in L2</template>
      <div>
        <div>
          <b>zkSync is a Layer-2 protocol</b>
        </div>
        <p>
          Your zkSync balances live in a separate space called Layer-2 (L2 for short). You won’t see them on
          <a href="https://etherscan.io" rel="noopener noreferrer" target="_blank">etherscan.io</a> or in your Ethereum wallet, only in zkSync wallet and block explorer.
          Nevertheless, balances in zkSync are as secure as if though they were in L1 (the Ethereum mainnet).
          <a href="https://zksync.io/faq/security.html" target="_blank" rel="noopener noreferrer">Learn more.</a>
        </p>
        <p>You can move your balances from L1 into zkSync by making a Deposit</p>
        <p>To move them back from zkSync to L1 you can make a Withdraw</p>
      </div>
    </i-modal>
    <div class="balancesBlock tileBlock">
      <div class="tileHeadline h3">
        <span>Balances in L2</span>
        <i class="ri-question-mark" @click="balanceInfoModal = true"></i>
      </div>
      <div v-if="!isSearching && !hasDisplayedBalances && loading === false" class="centerBlock">
        <p class="tileText">No balances yet, please make a deposit or request money from someone!</p>
        <i-button block link size="lg" variant="secondary" class="_margin-top-1" to="/deposit">+ Deposit</i-button>
      </div>
      <div v-else class="balances">
        <div v-if="!loading">
          <div class="_display-flex _justify-content-space-between">
            <i-button class="_padding-y-0" link size="lg" variant="secondary" to="/deposit">+ Deposit</i-button>
            <i-button class="_padding-y-0" link size="lg" variant="secondary" to="/withdraw">- Withdraw</i-button>
          </div>
          <i-button block class="_margin-y-1" size="lg" variant="secondary" to="/transfer"> <i class="ri-send-plane-fill"></i>&nbsp;&nbsp;Transfer </i-button>
          <i-input ref="searchInput" v-model="search" placeholder="Filter tokens" maxlength="6" autofocus>
            <i slot="prefix" class="ri-search-line"></i>
          </i-input>
        </div>

        <div v-if="loading" class="centerBlock">
          <loader />
        </div>
        <div v-else-if="isSearching && !hasDisplayedBalances" class="centerBlock">
          <span>
            Your search <strong>"{{ search }}"</strong> did not match any tokens
          </span>
        </div>
        <div v-else class="balancesList">
          <nuxt-link v-for="(item, index) in displayedList" :key="index" :to="`/account/${item.symbol}`" class="balanceItem">
            <div class="tokenSymbol">{{ item.symbol }}</div>
            <div class="rightSide">
              <div v-if="item.rawBalance" class="rowItem">
                <div class="total">
                  <span class="balancePrice">{{ item.rawBalance | formatUsdAmount(item.tokenPrice, item.symbol) }}</span>
                  &nbsp;&nbsp;{{ item.rawBalance | formatToken(item.symbol) }}
                </div>
                <div class="status">
                  <i-tooltip placement="left">
                    <i v-if="item.status === 'Verified'" class="verified ri-check-double-line"></i>
                    <i v-else class="committed ri-check-line"></i>
                    <template slot="body">{{ item.status }}</template>
                  </i-tooltip>
                </div>
              </div>
              <div v-if="activeDeposits[item.symbol]" class="rowItem">
                <div class="total small">
                  <span class="balancePrice">{{ activeDeposits[item.symbol].toString() | formatUsdAmount(item.tokenPrice, item.symbol) }}</span>
                  &nbsp;&nbsp;+{{ activeDeposits[item.symbol].toString() | formatToken(item.symbol) }}
                </div>
                <div class="status">
                  <loader size="xs" />
                </div>
              </div>
            </div>
          </nuxt-link>
        </div>
      </div>
      <mint :display="!isSearching && !hasDisplayedBalances && loading === false" class="_margin-top-2" @received="getBalances()" />
    </div>
  </div>
</template>

<script lang="ts">
import Mint from "@/blocks/Mint.vue";
import utils from "@/plugins/utils";
import { ZkInBalance, ZkInDeposits, ZKInDepositTx } from "@/plugins/types";
import { BigNumber } from "ethers";
import Vue from "vue";
import { TokenSymbol } from "zksync/build/types";

type DisplayToken = {
  symbol: string;
  tokenPrice: number;
  rawBalance: BigNumber | undefined;
  status: string | undefined;
};

let updateListInterval: ReturnType<typeof setInterval>;
export default Vue.extend({
  components: {
    Mint,
  },
  data() {
    return {
      search: "",
      loading: false,
      balanceInfoModal: false,
    };
  },
  computed: {
    zkBalances(): ZkInBalance[] {
      return this.$accessor.wallet.getzkBalances;
    },
    displayedList(): DisplayToken[] {
      const allTokenPrices = this.$accessor.tokens.getTokenPrices;
      const returnTokens = <
        {
          [symbol: string]: DisplayToken;
        }
      >{};
      this.zkBalances.forEach((token) => {
        returnTokens[token.symbol] = {
          symbol: token.symbol,
          tokenPrice: token.tokenPrice,
          rawBalance: token.rawBalance,
          status: token.status,
        };
      });
      for (const symbol in this.activeDeposits) {
        if (!returnTokens[symbol]) {
          returnTokens[symbol] = {
            symbol,
            tokenPrice: allTokenPrices[symbol].price,
            rawBalance: undefined,
            status: undefined,
          };
        } else {
          returnTokens[symbol].status = "Pending";
        }
      }
      const finalList = Object.keys(returnTokens).map((e) => returnTokens[e]);
      return <DisplayToken[]>utils.searchInArr(this.search, finalList, (e) => (e as DisplayToken).symbol);
    },
    activeDeposits() {
      this.$accessor.transaction.getForceUpdateTick; // Force to update the list
      const deposits: ZkInDeposits = this.$accessor.transaction.depositList;
      const activeDeposits = <ZkInDeposits>{};
      const finalDeposits = <{ [tokenSymbol: string]: BigNumber }>{};
      let ticker: TokenSymbol;
      for (ticker in deposits) {
        activeDeposits[ticker] = deposits[ticker].filter((tx: ZKInDepositTx) => tx.status === "Initiated");
      }
      for (ticker in activeDeposits) {
        if (activeDeposits[ticker].length > 0) {
          if (!finalDeposits[ticker]) {
            finalDeposits[ticker] = BigNumber.from("0");
          }
          let tx: ZKInDepositTx;
          for (tx of activeDeposits[ticker]) {
            finalDeposits[ticker] = finalDeposits[ticker].add(tx.amount);
          }
        }
      }
      return finalDeposits;
    },
    hasDisplayedBalances(): boolean {
      return this.displayedList.length !== 0;
    },
    isSearching(): boolean {
      return !!this.search.trim();
    },
  },
  beforeDestroy() {
    clearInterval(updateListInterval);
  },
  mounted() {
    this.getBalances();
    this.autoUpdateList();
  },
  methods: {
    async getBalances(): Promise<void> {
      if (this.displayedList.length === 0) {
        this.loading = true;
      }
      await this.$accessor.wallet.requestZkBalances({ accountState: undefined, force: false });
      this.loading = false;
    },
    autoUpdateList(): void {
      clearInterval(updateListInterval);
      updateListInterval = setInterval(() => {
        this.getBalances();
      }, 120000);
    },
  },
});
</script>
