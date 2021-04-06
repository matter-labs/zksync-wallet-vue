<template>
  <div class="chooseTokenBlock">
    <div v-if="loading === true" class="centerBlock">
      <loader />
    </div>
    <template v-else>
      <i-input ref="tokenSymbolInput" v-model="search" :placeholder="`Filter balances in ${tokensType}`" maxlength="10">
        <i slot="prefix" class="ri-search-line"></i>
      </i-input>
      <div class="tokenListContainer">
        <div v-for="item in displayedList" :key="item.symbol" class="tokenItem" @click="chooseToken(item)">
          <div class="tokenSymbol">{{ item.symbol }}</div>
          <div class="rightSide">
            <div class="balance">{{ item.balance }}</div>
          </div>
        </div>
        <div v-if="search && displayedList.length === 0" class="centerBlock">
          <span
            >Your search <b>"{{ search }}"</b> did not match any tokens</span
          >
        </div>
        <div v-else-if="displayedList.length === 0" class="centerBlock">
          <span>No balances yet. Please make a deposit or request money from someone!</span>
        </div>
      </div>
      <i-button block class="_margin-top-1" link size="lg" variant="secondary" @click="$accessor.openModal('NoTokenFound')"> Can't find a token? </i-button>
      <no-token-found />
    </template>
  </div>
</template>

<script lang="ts">
import NoTokenFound from "@/blocks/modals/NoTokenFound.vue";
import { Balance } from "@/plugins/types";
import Vue from "vue";

export default Vue.extend({
  components: {
    NoTokenFound,
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
    },
  },
  data() {
    return {
      search: "",
      loading: false,
    };
  },
  computed: {
    balances(): Array<Balance> {
      return this.tokensType === "L2" ? this.$accessor.wallet.getzkBalances : this.$accessor.wallet.getInitialBalances;
    },
    displayedList(): Array<Balance> {
      let list: Array<Balance>;
      list = !this.search.trim() ? this.balances : this.balances.filter((e: Balance) => e.symbol.toLowerCase().includes(this.search.trim().toLowerCase()));
      if (this.onlyAllowed) {
        list = list.filter((e) => !e.restricted);
      }
      return list;
    },
  },
  mounted() {
    this.getTokenList();
  },
  methods: {
    chooseToken(token: Balance): void {
      this.$emit("chosen", token);
    },
    async getTokenList(): Promise<void> {
      this.loading = true;
      if (this.tokensType === "L2") {
        await this.$accessor.wallet.requestZkBalances({ accountState: undefined, force: false });
      } else {
        await this.$accessor.wallet.requestInitialBalances(false);
      }
      this.loading = false;
    },
  },
});
</script>
