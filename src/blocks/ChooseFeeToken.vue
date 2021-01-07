<template>
  <div>
    <div v-if="tokensLoading===true" class="nothingFound">
      <loader/>
    </div>
    <template v-else>
      <i-input v-model="tokenSearch" placeholder="Filter balances in L2" maxlength="10">
        <i slot="prefix" class="far fa-search"></i>
      </i-input>
      <div class="tokenListContainer">
        <div v-for="item in displayedTokenList" :key="item.symbol" class="tokenItem" @click="chooseToken(item)">
          <div class="tokenSymbol">{{ item.symbol }}</div>
          <div class="rightSide">
            <div class="balance">{{ item.balance }}</div>
          </div>
        </div>
        <div v-if="tokenSearch && displayedTokenList.length ===0" class="nothingFound">
          <span>Your search <b>"{{ tokenSearch }}"</b> did not match any tokens</span>
        </div>
        <div v-else-if="displayedTokenList.length ===0" class="nothingFound">
          <span>No balances yet. Please make a deposit or request money from someone!</span>
        </div>
      </div>
    </template>

    <i-button v-if="showCantFindToken" block link size="lg" variant="secondary" class="_margin-top-1" @click="$store.dispatch('openModal', 'NoTokenFound')">
      Can't find a token?
    </i-button>
    <no-token-found v-if="showCantFindToken"/>
  </div>
</template>

<script>
import NoTokenFound from "~/blocks/modals/NoTokenFound";

export default {
  components: { NoTokenFound },
  props: {
    showCantFindToken: {
      required: false,
      default: false,
      type: Boolean,
    },
    showRestricted: {
      required: false,
      default: false,
      type: Boolean,
    },
    showZeroBalance: {
      required: false,
      default: true,
      type: Boolean,
    },
  },
  data() {
    return {
      cantFindTokenModal: false,
      tokenSearch: "",
      tokensLoading: false,
      choosedToken: false,
      tokensList: [],
    };
  },
  computed: {
    displayedTokenList: function () {
      const displayTokens = this.tokensList.filter((singleBalance) => {
        return this.filterBalances(singleBalance);
      });
      if (!this.tokenSearch.trim()) {
        return displayTokens;
      }
      return displayTokens.filter((e) => e.symbol.toLowerCase().includes(this.tokenSearch.trim().toLowerCase()));
    },
  },
  mounted() {
    this.getTokenList();
  },
  methods: {
    filterBalances: function (singleBalance) {
      let showBalance = true;
      if (!this.showZeroBalance) {
        showBalance = singleBalance.balance.gte(0);
      }
      if (!this.showRestricted) {
        showBalance = singleBalance.restricted === false;
      }
      return showBalance;
    },
    chooseToken: function (token) {
      this.$emit("input", token);
      this.$emit("selectToken");
    },
    getTokenList: async function () {
      this.tokensLoading = true;
      /**
       * @type {Array}
       */
      const balances = await this.$store.dispatch("wallet/getzkBalances");
      this.tokensList = balances.slice();
      this.tokensLoading = false;
    },
  },
};
</script>
