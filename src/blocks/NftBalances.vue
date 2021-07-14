<template>
  <div class="balancesBlock nftBalances tileBlock">
    <div class="tileHeadline h3">
      <span>NFT Tokens</span>
    </div>
    <div v-if="!isSearching && !hasDisplayedBalances && loading === false" class="centerBlock">
      <p class="tileText">No NFT tokens yet. You can either mint or request them from someone!</p>
      <i-button block link size="lg" variant="secondary" class="_margin-top-1" to="/nft/mint">+ Mint NFT</i-button>
    </div>
    <div v-else class="balances">
      <div v-if="!loading">
        <div class="_display-flex _justify-content-space-between">
          <i-button class="_padding-y-0" link size="lg" variant="secondary" to="/nft/mint">+ Mint NFT</i-button>
          <i-button class="_padding-y-0" link size="lg" variant="secondary" to="/nft/withdraw">- Withdraw NFT</i-button>
        </div>
        <i-button block class="_margin-y-1" size="lg" variant="secondary" to="/nft/transfer">
          <v-icon class="planeIcon" name="ri-send-plane-fill" />&nbsp;&nbsp;Transfer NFT
        </i-button>
        <i-input ref="searchInput" v-model="search" placeholder="Filter NFT tokens" maxlength="6" autofocus>
          <v-icon slot="prefix" name="ri-search-line" />
        </i-input>
      </div>

      <div v-if="loading" class="centerBlock">
        <loader />
      </div>
      <div v-else-if="isSearching && !hasDisplayedBalances" class="centerBlock">
        <span>
          Your search <strong>"{{ search }}"</strong> did not match any NFT tokens
        </span>
      </div>
      <div v-else class="balancesList nftList">
        <nuxt-link v-for="(item, index) in displayedList" :key="index" :to="`/nft/${item.id}`" class="balanceItem">
          <div class="leftSide _display-flex _align-items-center">
            <div class="tokenSymbol">
              {{ item.symbol }}
            </div>
            <div class="status _margin-left-05 _hidden-md-and-up">
              <v-icon v-if="item.status === 'Verified'" class="verified" name="ri-check-double-line" />
              <v-icon v-else class="committed" name="ri-check-line" />
            </div>
          </div>
          <div class="rightSide">
            <div class="rowItem">
              <div class="status _hidden-md-and-down">
                <i-tooltip placement="left">
                  <v-icon v-if="item.status === 'Verified'" class="verified" name="ri-check-double-line" />
                  <v-icon v-else class="committed" name="ri-check-line" />
                  <template slot="body">{{ item.status }}</template>
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
import utils from "@/plugins/utils";
import { ZkInNFT } from "@/types/lib";
import Vue from "vue";
import { NFT } from "zksync/build/types";
export default Vue.extend({
  data() {
    return {
      search: "",
      loading: false,
    };
  },
  computed: {
    zkNfts(): ZkInNFT[] {
      return this.$accessor.wallet.getNftBalances;
    },
    displayedList(): ZkInNFT[] {
      return <ZkInNFT[]>utils.searchInArr(this.search, this.zkNfts, (e) => (e as NFT).symbol);
    },
    hasDisplayedBalances(): boolean {
      return this.displayedList.length !== 0;
    },
    isSearching(): boolean {
      return !!this.search.trim();
    },
  },
});
</script>
