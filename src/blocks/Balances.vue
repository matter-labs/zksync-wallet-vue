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
          <a href="//etherscan.io" target="_blank" rel="noopener noreferrer">etherscan.io</a> or in your Ethereum wallet, only in zkSync wallet and block explorer. Nevertheless,
          balances in zkSync are as secure as if though they were in L1 (the Ethereum mainnet).
          <a href="//zksync.io/faq/security.html" target="_blank" rel="noopener noreferrer">Learn more.</a>
        </p>
        <p>You can move your balances from L1 into zkSync by making a Deposit</p>
        <p>To move them back from zkSync to L1 you can make a Withdraw</p>
      </div>
    </i-modal>
    <div class="balancesBlock tileBlock">
      <div class="tileHeadline h3">
        <span>Balances in L2</span>
        <i class="fas fa-question" @click="balanceInfoModal = true"></i>
      </div>
      <div v-if="balances.length === 0 && loading === false" class="centerBlock">
        <p class="tileText">No balances yet, please make a deposit or request money from someone!</p>
        <i-button block link size="lg" variant="secondary" class="_margin-top-1" to="/deposit">+ Deposit</i-button>
      </div>
      <div v-else class="balances">
        <div v-if="!loading">
          <div class="_display-flex _justify-content-space-between">
            <i-button class="_padding-y-0" link size="lg" variant="secondary" to="/deposit">+ Deposit</i-button>
            <i-button class="_padding-y-0" link size="lg" variant="secondary" to="/withdraw">- Withdraw</i-button>
          </div>
          <i-button block class="_margin-y-1" size="lg" variant="secondary" to="/transfer"><i class="fas fa-paper-plane"></i>&nbsp;&nbsp;Transfer</i-button>
          <i-input v-model="search" placeholder="Filter tokens" maxlength="6">
            <i slot="prefix" class="far fa-search"></i>
          </i-input>
        </div>

        <div v-if="loading" class="centerBlock">
          <loader />
        </div>
        <div v-else-if="search && displayedList.length === 0" class="centerBlock">
          <span
            >Your search <b>"{{ search }}"</b> did not match any tokens</span
          >
        </div>
        <div v-else class="balancesList">
          <nuxt-link v-for="(item, index) in displayedList" :key="index" :to="`/account/${item.symbol}`" class="balanceItem">
            <div class="tokenSymbol">{{ item.symbol }}</div>
            <div class="rightSide">
              <div class="total">
                <span class="balancePrice">{{ item.formattedTotalPrice }}</span
                >&nbsp;&nbsp;{{ item.balance }}
              </div>
              <div class="status">
                <i-tooltip>
                  <i v-if="item.status === 'Finalized'" class="verified far fa-check-double"></i>
                  <i v-else class="committed far fa-check"></i>
                  <template slot="body">{{ item.status }}</template>
                </i-tooltip>
              </div>
            </div>
          </nuxt-link>
        </div>
      </div>
      <mint :display="balances.length === 0 && loading === false" class="_margin-top-2" @received="getBalances()" />
    </div>
  </div>
</template>

<script>
import Mint from "@/blocks/Mint.vue";
import utils from "@/plugins/utils";

export default {
  components: {
    Mint,
  },
  data() {
    return {
      balances: [],
      search: "",
      loading: true,
      balanceInfoModal: false,
    };
  },
  computed: {
    displayedList() {
      if (!this.search.trim()) {
        return this.balances;
      }
      return this.balances.filter((e) => e.symbol.toLowerCase().includes(this.search.trim().toLowerCase()));
    },
  },
  mounted() {
    this.getBalances();
  },
  methods: {
    async getBalances() {
      this.loading = true;
      /**
       * @type {Array}
       */
      const balances = await this.$store.dispatch("wallet/getzkBalances");
      this.balances = balances
        .slice()
        .sort(utils.sortBalancesById)
        .filter((e) => {
          console.log("filter balances:", e.balance, typeof e.balance, e, e.balance > 0);
          return e.balance > 0;
        });
      this.loading = false;
    },
  },
};
</script>
