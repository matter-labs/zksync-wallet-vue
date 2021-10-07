<template>
  <div class="balancesBlock tileBlock">
    <i-modal v-model="balanceInfoModal" size="md">
      <template slot="header">zkSync is a Layer-2 protocol</template>
      <p>
        Your zkSync balances live in a separate space called Layer-2 (L2 for short). You won’t see them on
        <a href="https://etherscan.io" rel="noopener noreferrer" target="_blank">etherscan.io</a> or in your Ethereum wallet, only in zkSync wallet and block explorer.
        Nevertheless, balances in zkSync are as secure as if though they were in L1 (the Ethereum mainnet).
        <a href="https://zksync.io/faq/security.html" target="_blank" rel="noopener noreferrer">Learn more.</a>
      </p>
      <p>You can move your balances <b>from L1</b> into zkSync by making a <nuxt-link class="logoLinkContainer" to="/transaction/deposit">Deposit</nuxt-link></p>
      <p>To move them back from zkSync <b>to L1</b> you can make a <nuxt-link class="logoLinkContainer" to="/transaction/withdraw">Withdraw</nuxt-link></p>
    </i-modal>
    <div class="tileHeadline h3">
      <span>Balances in L2</span>
      <span class="icon-container _display-flex" @click="balanceInfoModal = true">
        <v-icon id="questionMark" name="ri-question-mark" class="iconInfo" scale="0.9" />
      </span>
    </div>
    <slot />
    <div v-if="!isSearching && !hasDisplayedBalances && (accountStateLoading === false || accountStateRequested)" class="centerBlock">
      <p class="tileText">No balances yet, please make a deposit or request money from someone!</p>
      <i-button data-cy="account_deposit_button" block link size="lg" variant="secondary" class="_margin-top-1" to="/transaction/deposit">+ Deposit from L1</i-button>
    </div>
    <div v-else class="balances">
      <div v-if="!accountStateLoading || accountStateRequested">
        <div class="_display-flex _justify-content-space-between">
          <i-button data-cy="account_deposit_button" class="_padding-y-0" link size="lg" variant="secondary" to="/transaction/deposit">
            + Deposit <span class="desktopOnly">&nbsp;from L1</span>
          </i-button>
          <i-button data-cy="account_withdraw_button" class="_padding-y-0" link size="lg" variant="secondary" to="/transaction/withdraw">
            - Withdraw <span class="desktopOnly">&nbsp;to L1</span>
          </i-button>
        </div>
        <i-button data-cy="account_transfer_button" block class="_margin-y-1" size="lg" variant="secondary" to="/transaction/transfer">
          <v-icon class="planeIcon" name="ri-send-plane-fill" />&nbsp;&nbsp;Transfer
        </i-button>
        <i-input ref="searchInput" v-model="search" placeholder="Filter tokens" maxlength="6" autofocus>
          <v-icon slot="prefix" name="ri-search-line" />
        </i-input>
      </div>

      <div v-if="accountStateLoading && !accountStateRequested" class="centerBlock">
        <loader />
      </div>
      <div v-else-if="isSearching && !hasDisplayedBalances" class="centerBlock">
        <span>
          Your search <strong>"{{ search }}"</strong> did not match any tokens
        </span>
      </div>
      <div v-else class="balancesList">
        <nuxt-link v-for="(item, symbol) in displayedList" :key="symbol" :to="`/token/${symbol}`" class="balanceItem">
          <div class="leftSide _display-flex _align-items-center">
            <div class="tokenSymbol">
              {{ symbol }}
            </div>
            <div class="status _margin-left-05 _hidden-md-and-up">
              <v-icon v-if="item.verified" class="verified" name="ri-check-double-line" />
              <v-icon v-else class="committed" name="ri-check-line" />
            </div>
          </div>
          <div class="rightSide">
            <div class="rowItem">
              <div class="total">
                <span class="balancePrice">
                  <token-price :symbol="symbol" :amount="item.balance" />
                </span>
                &nbsp;&nbsp;{{ item.balance | parseBigNumberish(symbol) }}
              </div>
              <div class="status _hidden-sm-and-down">
                <i-tooltip placement="left">
                  <v-icon v-if="item.verified" class="verified" name="ri-check-double-line" />
                  <v-icon v-else class="committed" name="ri-check-line" />
                  <template slot="body">{{ item.verified ? "Verified" : "Pending" }}</template>
                </i-tooltip>
              </div>
            </div>
            <div v-if="activeDeposits[symbol]" class="rowItem">
              <div class="total small">
                <span class="balancePrice">
                  Depositing:
                  <token-price :symbol="symbol" :amount="activeDeposits[symbol].amount" />
                </span>
                &nbsp;&nbsp;+{{ activeDeposits[symbol].amount | parseBigNumberish(symbol) }}
              </div>
              <div class="status">
                <loader size="xs" />
              </div>
            </div>
          </div>
        </nuxt-link>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { searchByKey } from "matter-dapp-module/utils";
import { ZkTokenBalances } from "matter-dapp-module/types";
export default Vue.extend({
  data() {
    return {
      search: "",
      balanceInfoModal: false,
    };
  },
  computed: {
    accountStateLoading(): boolean {
      return this.$store.getters["zk-account/accountStateLoading"];
    },
    accountStateRequested(): boolean {
      return this.$store.getters["zk-account/accountStateRequested"];
    },
    zkBalances(): ZkTokenBalances {
      return this.$store.getters["zk-balances/balances"];
    },
    zkBalancesWithDeposits(): ZkTokenBalances {
      const tokens = this.$store.getters["zk-tokens/zkTokens"];
      const zkBalancesWithDeposits = this.zkBalances;
      for (const symbol in this.activeDeposits) {
        if (!zkBalancesWithDeposits[symbol]) {
          zkBalancesWithDeposits[symbol] = {
            balance: "0",
            verified: false,
            feeAvailable: tokens[symbol] ? tokens[symbol].enabledForFees : false,
          };
        }
      }
      return zkBalancesWithDeposits;
    },
    displayedList(): ZkTokenBalances {
      return searchByKey(this.zkBalancesWithDeposits, this.search);
    },
    activeDeposits() {
      return this.$store.getters["zk-balances/depositingBalances"];
    },
    hasDisplayedBalances(): boolean {
      return Object.keys(this.displayedList).length !== 0 || Object.keys(this.activeDeposits).length !== 0;
    },
    isSearching(): boolean {
      return !!this.search.trim();
    },
  },
});
</script>
