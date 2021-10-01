<template>
  <div class="balancesBlock tileBlock">
    <div class="tileHeadline h3">
      <span>NFT Tokens</span>
    </div>
    <slot />
    <div v-if="!isSearching && !hasDisplayedBalances && (accountStateLoading === false || accountStateRequested)" class="centerBlock">
      <p class="tileText">No NFT tokens yet. You can either mint or request them from someone!</p>
      <i-button data-cy="account_deposit_button" block link size="lg" variant="secondary" class="_margin-top-1" to="/transaction/nft/mint">+ Mint NFT</i-button>
    </div>
    <div v-else class="balances">
      <div v-if="!accountStateLoading || accountStateRequested">
        <div class="_display-flex _justify-content-space-between">
          <i-button data-cy="account_deposit_button" class="_padding-y-0" link size="lg" variant="secondary" to="/transaction/nft/mint">+ Mint NFT</i-button>
          <i-button data-cy="account_withdraw_button" class="_padding-y-0" link size="lg" variant="secondary" to="/transaction/nft/withdraw">
            - Withdraw NFT <span class="desktopOnly">&nbsp;to L1</span>
          </i-button>
        </div>
        <i-button data-cy="account_transfer_button" block class="_margin-y-1" size="lg" variant="secondary" to="/transaction/nft/transfer">
          <v-icon class="planeIcon" name="ri-send-plane-fill" />&nbsp;&nbsp;Transfer NFT
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
          Your search <strong>"{{ search }}"</strong> did not match any NFT tokens
        </span>
      </div>
      <div v-else class="balancesList">
        <nuxt-link v-for="(item, tokenID) in displayedList" :key="tokenID" :to="`/nft/token/${tokenID}`" class="balanceItem">
          <div class="leftSide _display-flex _align-items-center">
            <div class="tokenSymbol">NFT-{{ tokenID }}</div>
            <div class="status _margin-left-05 _hidden-md-and-up">
              <v-icon v-if="item.verified" class="verified" name="ri-check-double-line" />
              <v-icon v-else class="committed" name="ri-check-line" />
            </div>
          </div>
          <div class="rightSide">
            <div class="rowItem">
              <div class="status _hidden-sm-and-down">
                <i-tooltip placement="left">
                  <v-icon v-if="item.verified" class="verified" name="ri-check-double-line" />
                  <v-icon v-else class="committed" name="ri-check-line" />
                  <template slot="body">{{ item.verified ? "Verified" : "Pending" }}</template>
                </i-tooltip>
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
import { ZkNFTBalances } from "matter-dapp-module/types";
export default Vue.extend({
  data() {
    return {
      search: "",
    };
  },
  computed: {
    accountStateLoading(): boolean {
      return this.$store.getters["zk-account/accountStateLoading"];
    },
    accountStateRequested(): boolean {
      return this.$store.getters["zk-account/accountStateRequested"];
    },
    zkBalances(): ZkNFTBalances {
      return this.$store.getters["zk-balances/nfts"];
    },
    displayedList(): ZkNFTBalances {
      return searchByKey(this.zkBalances, this.search);
    },
    hasDisplayedBalances(): boolean {
      return Object.keys(this.displayedList).length !== 0;
    },
    isSearching(): boolean {
      return !!this.search.trim();
    },
  },
});
</script>
