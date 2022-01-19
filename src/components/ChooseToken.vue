<template>
  <div class="chooseTokenBlock">
    <div v-if="mainLoading" class="centerBlock">
      <loader />
    </div>
    <template v-else>
      <div class="searchContainer">
        <i-input
          ref="tokenSymbolInput"
          v-model="search"
          data-cy="choose_token_block_token_input"
          :placeholder="tokensType === 'L2-NFT' ? 'Filter NFT tokens' : `Filter balances in ${tokensType}`"
          maxlength="10"
        >
          <i>
            <v-icon slot="prefix" name="ri-search-line" />
          </i>
        </i-input>
        <div class="updateBtn" :class="{ disabled: secondaryLoading }" @click="updateBalances()">
          <i-tooltip placement="left">
            <v-icon v-if="secondaryLoading" name="ri-loader-5-line" class="spin-animation" />
            <v-icon v-else name="ri-restart-line" />
            <template slot="body">Update {{ tokensType }} balances</template>
          </i-tooltip>
        </div>
      </div>
      <div class="tokenListContainer genericListContainer _margin-top-05">
        <template v-for="(balance, symbolOrID) in displayedList">
          <div
            :key="symbolOrID"
            class="tokenItem"
            :class="{ disabled: feeAcceptable && !allowedFeeTokens[symbolOrID] }"
            :data-cy="`token_item_${symbolOrID}`"
            @click="chooseToken(symbolOrID)"
          >
            <div class="tokenSymbol">
              <span>{{ tokensType === "L2-NFT" ? "NFT-" : "" }}{{ symbolOrID }}</span>
              <i-tooltip v-if="tokensType === 'L2-Tokens' && !allowedFeeTokens[symbolOrID]" placement="bottom">
                <v-icon class="iconInfo" name="ri-error-warning-line" />
                <template slot="body">Not available for paying fees</template>
              </i-tooltip>
            </div>
            <div v-if="displayTokenBalance" class="rightSide">
              <div class="balance">{{ balance | parseBigNumberish(symbolOrID) }}</div>
            </div>
          </div>
        </template>
        <div v-if="isSearching && !hasDisplayedBalances" class="centerBlock">
          <span>
            Your search <b>"{{ search }}"</b> did not match any tokens
          </span>
        </div>
        <div v-else-if="!hasDisplayedBalances" class="centerBlock">
          <span v-if="tokensType === 'L2-NFT'"
            >No available NFT tokens yet. You can either <nuxt-link to="/transaction/nft/mint">mint</nuxt-link> or request them from someone!</span
          >
          <span v-else>No balances yet. Please make a deposit or request money from someone!</span>
        </div>
      </div>
      <template v-if="tokensType !== 'L2-NFT'">
        <i-button block class="_margin-top-1" link size="lg" variant="secondary" @click="$accessor.openModal('NoTokenFound')"> Can't find a token?</i-button>
        <block-modals-no-token-found />
      </template>
      <template v-else>
        <i-button block class="_margin-top-1" link size="lg" variant="secondary" @click="$accessor.openModal('NoNftTokenFound')"> Can't find a token?</i-button>
        <block-modals-no-nft-token-found />
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import Vue, { PropOptions } from "vue";
import { searchByKey, searchInObject } from "@matterlabs/zksync-nuxt-core/utils";
import { ZkTransactionMainToken, ZkTokenBalances, ZkEthereumBalances, ZkNFTBalances } from "@matterlabs/zksync-nuxt-core/types";
import { BigNumberish } from "ethers";
import { Tokens } from "zksync/build/types";

export default Vue.extend({
  props: {
    onlyMintTokens: {
      type: Boolean,
      default: false,
      required: false,
    },
    feeAcceptable: {
      type: Boolean,
      default: false,
      required: false,
    },
    tokensType: {
      type: String,
      default: "L2-Tokens",
      required: false,
    } as PropOptions<ZkTransactionMainToken>,
  },
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
    ethereumBalanceLoadingAll(): boolean {
      return this.$store.getters["zk-balances/ethereumBalanceLoadingAll"];
    },
    ethereumBalancesRequested(): boolean {
      return this.$store.getters["zk-balances/ethereumBalancesRequested"];
    },
    zkTokens(): Tokens {
      return this.$store.getters["zk-tokens/zkTokens"];
    },
    zkTokensLoading(): boolean {
      return this.$store.getters["zk-tokens/zkTokensLoading"];
    },
    mintTokens(): Tokens {
      if (this.zkTokensLoading) {
        return {};
      }
      return Object.fromEntries(Object.entries(this.zkTokens ? this.zkTokens : {}).filter(([symbol]) => symbol !== "ETH"));
    },
    zkBalances(): ZkTokenBalances {
      return this.$store.getters["zk-balances/balances"];
    },
    nftBalances(): ZkNFTBalances {
      return this.$store.getters["zk-balances/nfts"];
    },
    ethereumBalances(): ZkEthereumBalances {
      this.ethereumBalanceLoadingAll;
      return this.$store.getters["zk-balances/ethereumBalances"];
    },
    mainLoading(): boolean {
      if (this.onlyMintTokens) {
        return this.zkTokensLoading;
      }
      if (this.tokensType === "L1-Tokens") {
        return this.ethereumBalanceLoadingAll && !this.ethereumBalancesRequested;
      }
      return this.accountStateLoading && !this.accountStateRequested;
    },
    secondaryLoading(): boolean {
      if (this.tokensType === "L1-Tokens") {
        return this.ethereumBalanceLoadingAll;
      }
      return this.accountStateLoading;
    },
    displayedList(): { [symbolOrID: string]: BigNumberish } {
      if (this.onlyMintTokens) {
        return searchByKey(Object.fromEntries(Object.entries(this.mintTokens).map(([symbol]) => [symbol, "0"])), this.search);
      } else if (this.tokensType === "L1-Tokens") {
        return searchByKey(Object.fromEntries(Object.entries(this.ethereumBalances).map(([symbol, balance]) => [symbol, balance.toString()])), this.search);
      } else if (this.tokensType === "L2-Tokens") {
        return searchByKey(Object.fromEntries(Object.entries(this.zkBalances).map(([symbol, token]) => [symbol, token.balance.toString()])), this.search);
      } else if (this.tokensType === "L2-NFT") {
        return Object.fromEntries(Object.entries(searchInObject(this.nftBalances, this.search, ([tokenID, _]) => `NFT-${tokenID}`)).map(([tokenID, _]) => [tokenID, 1]));
      }
      return {};
    },
    allowedFeeTokens(): { [symbol: string]: boolean } {
      return Object.fromEntries(Object.entries(this.zkBalances).map(([symbol, token]) => [symbol, token.feeAvailable]));
    },
    hasDisplayedBalances(): boolean {
      return Object.keys(this.displayedList).length !== 0;
    },
    isSearching(): boolean {
      return !!this.search.trim();
    },
    displayTokenBalance(): boolean {
      return !this.onlyMintTokens && (this.tokensType === "L1-Tokens" || this.tokensType === "L2-Tokens");
    },
  },
  methods: {
    updateBalances() {
      if (this.tokensType === "L1-Tokens") {
        this.$store.dispatch("zk-balances/requestEthereumBalances", true);
      } else {
        this.$store.dispatch("zk-account/updateAccountState", true);
      }
    },
    chooseToken(symbolOrID: string) {
      if (this.feeAcceptable && !this.allowedFeeTokens[symbolOrID]) {
        return;
      }
      if (this.tokensType === "L2-NFT") {
        return this.$emit("chosen", parseInt(symbolOrID));
      }
      return this.$emit("chosen", symbolOrID);
    },
  },
});
</script>
