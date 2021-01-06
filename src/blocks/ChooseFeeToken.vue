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
            <div class="balance">{{ item.formatedBalance }}</div>
          </div>
        </div>
        <div v-if="tokenSearch && displayedTokenList.length===0" class="nothingFound">
          <span>Your search <b>"{{ tokenSearch }}"</b> did not match any tokens</span>
        </div>
        <div v-else-if="displayedTokenList.length===0" class="nothingFound">
          <span>No balances yet. Please make a deposit or request money from someone!</span>
        </div>
      </div>
    </template>

    <i-button v-if="showCantFindToken" block link size="lg" variant="secondary" class="_margin-top-1" @click="cantFindTokenModal=true">
      Can't find a token?
    </i-button>
    <i-modal v-model="cantFindTokenModal" size="md">
      <template slot="header">Can't find a token</template>
      <div>
        <p>zkSync currently supports the most popular tokens, we will be adding more over time. <a
            href="//zksync.io/contact.html" target="_blank" rel="noopener noreferrer">Let us know what tokens you
          need</a>!</p>
      </div>
    </i-modal>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      required: false,
    },
    showCantFindToken: {
      required: false,
      default: false,
      type: Boolean,
    },
    checkAccountLocked: {
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
    isAccountLocked: function () {
      return this.$store.getters["wallet/isAccountLocked"];
    },
    displayedTokenList: function () {
      if (!this.tokenSearch.trim()) {
        return this.tokensList;
      }
      return this.tokensList.filter((e) => e.symbol.toLowerCase().includes(this.tokenSearch.trim().toLowerCase()));
    },
  },
  mounted() {
    this.getTokenList();
  },
  methods: {
    filterBalances: function (singleBalance) {
      if (this.checkAccountLocked) {
        if (this.isAccountLocked === true && singleBalance.restricted) {
          return false;
        }
      }
      if (!this.showZeroBalance) {
        if (singleBalance.balance <= 0) {
          return false;
        }
      }
      return singleBalance.restricted === false;
    },
    chooseToken: function (token) {
      this.$emit("input", token);
      this.$emit("selectToken");
    },
    getTokenList: async function () {
      this.tokensLoading = true;
      try {
        const balances = await this.$store.dispatch("wallet/getzkBalances");
        this.tokensList = balances.filter((e) => this.filterBalances(e));
      } catch (error) {
        await this.$store.dispatch("toaster/error", error.message);
      }
      this.tokensLoading = false;
    },
  },
};
</script>
