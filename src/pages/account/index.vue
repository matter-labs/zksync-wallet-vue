<template>
  <div class="walletPage dappPageWrapper">
    <i-modal v-if="balanceInfoModal" v-model="balanceInfoModal" size="md">
      <template slot="header">zkSync is a Layer-2 protocol</template>
      <p>
        Your zkSync balances live in a separate space called Layer-2 (L2 for short). You won’t see them on
        <a href="https://etherscan.io" rel="noopener noreferrer" target="_blank">etherscan.io</a>
        or in your Ethereum wallet, only in zkSync wallet and block explorer. Nevertheless, balances in zkSync are as secure as if though they were in L1 (the Ethereum mainnet).
        <a href="https://zksync.io/faq/security.html" target="_blank" rel="noopener noreferrer">Learn more.</a>
      </p>
      <p>You can move your balances from L1 into zkSync by making a Deposit</p>
      <p>To move them back from zkSync to L1 you can make a Withdraw</p>
    </i-modal>
    <div class="balancesBlock tileBlock">
      <div class="tileHeadline h3">
        <span>Balances in L2</span>
        <i class="ri-question-mark" @click="balanceInfoModal = true" />
      </div>
      <wallet-address class="clickablePicture" :wallet="walletAddress" @clickPicture="openAccountModal()" />
      <div v-if="!isSearching && !hasDisplayedBalances && loading === false" class="centerBlock">
        <p class="tileText">No balances yet, please make a deposit or request money from someone!</p>
        <i-button block link size="lg" variant="secondary" class="_margin-top-1" to="/deposit">+ Deposit</i-button>
      </div>
      <div v-else class="balances">
        <div v-if="!loading" class="_margin-top-1 _mobile-no-margin">
          <div class="_display-flex _justify-content-space-between">
            <i-button class="_padding-y-0" link size="lg" variant="secondary" to="/deposit">+ Deposit</i-button>
            <i-button class="_padding-y-0" link size="lg" variant="secondary" to="/withdraw">- Withdraw</i-button>
          </div>
          <i-button block class="_margin-y-1 button-with-icon" size="lg" variant="secondary" to="/transfer"><i class="ri-send-plane-fill" />&nbsp;&nbsp;Transfer</i-button>
          <i-input ref="searchInput" v-model="search" placeholder="Filter tokens" maxlength="6" autofocus>
            <i slot="prefix" class="ri-search-line" />
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
          <nuxt-link v-for="(item, index) in zkBalances" :key="index" :to="`/account/${item.symbol}`" class="balanceItem">
            <div class="tokenSymbol">{{ item.symbol }}</div>
            <div class="rightSide">
              <div v-if="item.rawBalance" class="rowItem">
                <div class="total">
                  <span class="balancePrice">
                    <token-price :symbol="item.symbol" :amount="item.rawBalance.toString()" />
                  </span>
                  &nbsp;&nbsp;{{ item.rawBalance | formatToken(item.symbol) }}
                </div>
                <div class="status">
                  <i-tooltip placement="left">
                    <i v-if="item.status === 'Verified'" class="verified ri-check-double-line" />
                    <i v-else class="committed ri-check-line" />
                    <template slot="body">{{ item.status }}</template>
                  </i-tooltip>
                </div>
              </div>
              <div v-if="item.pendingBalance" class="rowItem">
                <div class="total small">
                  <span class="balancePrice">
                    Depositing:
                    <token-price :symbol="item.symbol" :amount="item.pendingBalance.toString()" />
                  </span>
                  &nbsp;&nbsp;+{{ item.pendingBalance | formatToken(item.symbol) }}
                </div>
                <div class="status">
                  <loader size="xs" />
                </div>
              </div>
            </div>
          </nuxt-link>
        </div>
      </div>
      <lazy-block-mint :display="!isSearching && !hasDisplayedBalances && loading === false" class="_margin-top-2" @received="getBalances()" />
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { ZKTypeDisplayToken } from "~/types/lib";

let updateListInterval: ReturnType<typeof setInterval>;
export default Vue.extend({
  data() {
    return {
      search: "",
      loading: false,
      initiated: false,
      balanceInfoModal: false,
      zkBalances: <ZKTypeDisplayToken[]>[],
      walletInfoModal: false,
    };
  },
  async fetch() {
    await this.getBalances();
  },
  computed: {
    walletAddress() {
      return this.$accessor.account.address;
    },
    hasDisplayedBalances(): boolean {
      return this.zkBalances.length > 0;
    },
    isSearching(): boolean {
      return !!this.search.trim();
    },
  },
  beforeDestroy() {
    clearInterval(updateListInterval);
  },
  mounted() {
    this.autoUpdateList();
  },
  methods: {
    async getBalances(): Promise<void> {
      if (this.zkBalances.length === 0 && !this.initiated) {
        this.loading = true;
      }
      this.zkBalances = await this.$accessor.wallet.displayZkBalances(this.search);
      this.loading = false;
      this.initiated = true;
    },
    autoUpdateList(): void {
      clearInterval(updateListInterval);
      updateListInterval = setInterval(() => {
        this.getBalances();
      }, 120000);
    },
    openAccountModal() {
      this.$accessor.setAccountModalState(true);
    },
  },
});
</script>
