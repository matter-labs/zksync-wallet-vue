<template>
  <div class="chooseTokenBlock">
    <div v-if="loading === true" class="centerBlock">
      <loader />
    </div>
    <template v-else>
      <div class="searchContainer">
        <i-input ref="tokenSymbolInput" data-cy="choose_token_block_token_input" v-model="search" :placeholder="tokensType === 'NFT' ? 'Filter NFT tokens' : `Filter balances in ${tokensType}`" maxlength="10">
          <i>
            <v-icon slot="prefix" name="ri-search-line" />
          </i>
        </i-input>
        <div class="updateBtn" :class="{ disabled: spinnerLoading }" @click="getTokenList(true)">
          <i-tooltip placement="left">
            <v-icon v-if="spinnerLoading" name="ri-loader-5-line" class="spin-animation" />
            <v-icon v-else name="ri-restart-line" />
            <template slot="body">Update {{ tokensType }} balances</template>
          </i-tooltip>
        </div>
      </div>
      <div class="tokenListContainer genericListContainer _margin-top-05">
        <div v-for="item in displayedList" :key="item.symbol" class="tokenItem" :data-cy="`token_item_${item.symbol}`" @click="chooseToken(item)">
          <div class="tokenSymbol">{{ item.symbol }}</div>
          <div v-if="tokensType === 'L1' || tokensType === 'L2'" class="rightSide">
            <div class="balance">{{ item.balance }}</div>
          </div>
        </div>
        <div v-if="search && displayedList.length === 0" class="centerBlock">
          <span>
            Your search <b>"{{ search }}"</b> did not match any tokens
          </span>
        </div>
        <div v-else-if="displayedList.length === 0" class="centerBlock">
          <span v-if="tokensType === 'NFT'">No available NFT tokens yet. You can either <nuxt-link to="/nft/mint">mint</nuxt-link> or request them from someone!</span>
          <span v-else>No balances yet. Please make a deposit or request money from someone!</span>
        </div>
      </div>
      <template v-if="tokensType !== 'NFT'">
        <i-button block class="_margin-top-1" link size="lg" variant="secondary" @click="$accessor.openModal('NoTokenFound')"> Can't find a token?</i-button>
        <no-token-found />
      </template>
      <template v-else>
        <i-button block class="_margin-top-1" link size="lg" variant="secondary" @click="$accessor.openModal('NoNftTokenFound')"> Can't find a token?</i-button>
        <no-nft-token-found />
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import NoTokenFound from "@/blocks/modals/NoTokenFound.vue";
import NoNftTokenFound from "@/blocks/modals/NoNftTokenFound.vue";
import utils from "@/plugins/utils";
import { walletData } from "@/plugins/walletData";
import { ZkInBalance, ZkInNFT } from "@/types/lib";

import Vue, { PropOptions } from "vue";

type TokensType = "L1" | "L2" | "NFT";

export default Vue.extend({
  components: {
    NoTokenFound,
    NoNftTokenFound,
  },
  props: {
    onlyAllowed: {
      type: Boolean,
      default: false,
      required: false,
    },
    tokensType: {
      type: String,
      default: "L2",
      required: false,
    } as PropOptions<TokensType>,
  },
  data() {
    return {
      search: "",
      loading: true,
      spinnerLoading: false,
    };
  },
  computed: {
    balances(): ZkInBalance[] | ZkInNFT[] {
      switch (this.tokensType) {
        case "L1":
          return this.$accessor.wallet.getInitialBalances;
        case "NFT":
          return this.getNFTs();

        default:
          return this.$accessor.wallet.getzkBalances;
      }
    },
    displayedList(): ZkInBalance[] | ZkInNFT[] {
      let list = utils.searchInArr(this.search, this.balances, (e) => (e as ZkInBalance | ZkInNFT).symbol) as ZkInBalance[] | ZkInNFT[];
      if (this.tokensType !== "NFT" && this.onlyAllowed) {
        const availableTokens = this.$accessor.tokens.getAvailableTokens;
        list = (list as ZkInBalance[]).filter((e) => availableTokens.hasOwnProperty(e.symbol));
      }
      return list;
    },
  },
  async mounted() {
    await this.getTokenList();
    this.loading = false;
  },
  methods: {
    chooseToken(token: ZkInBalance | ZkInNFT): void {
      this.$emit("chosen", token);
    },
    async getTokenList(force = false): Promise<void> {
      this.spinnerLoading = true;
      if (this.tokensType === "L2" || this.tokensType === "NFT") {
        await this.$accessor.wallet.requestZkBalances({ accountState: undefined, force });
      } else {
        await this.$accessor.wallet.requestInitialBalances(force);
      }
      this.spinnerLoading = false;
    },
    getNFTs() {
      const mintedNfts = walletData.get().accountState!.committed.mintedNfts;
      const finalArr = [];
      for (const nft of this.$accessor.wallet.getNftBalances) {
        if (mintedNfts.hasOwnProperty(nft.id) && nft.status === "Pending") {
          continue;
        }
        finalArr.push(nft);
      }
      return finalArr;
    },
  },
});
</script>
