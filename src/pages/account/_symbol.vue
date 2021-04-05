<template>
  <div class="tokenAccount">
    <div class="tileBlock">
      <div class="tileHeadline withBtn h3">
        <nuxt-link :to="fromRoute && fromRoute.fullPath !== $route.fullPath && fromRoute.path !== '/withdraw' ? fromRoute : '/account'" class="returnBtn">
          <i class="ri-arrow-left-line"></i>
        </nuxt-link>
        <span class="tokenSymbol">{{ symbol }}</span>
      </div>
      <div v-if="loading">
        <loader class="_display-block _margin-x-auto _margin-y-3" />
      </div>
      <div v-else>
        <div class="infoBlock">
          <div class="headline">Token price:</div>
          <div class="balancePrice">~${{ token.tokenPrice.toFixed(2) }}</div>
        </div>
        <div class="infoBlock _margin-top-1">
          <div class="headline">Your balance:</div>
        </div>
        <div class="_display-flex _justify-content-space-between balanceWithdraw">
          <div class="infoBlock">
            <div class="balance">
              <span class="tokenSymbol">{{ symbol }}</span> {{ token.balance }}&nbsp;&nbsp;<span class="balancePrice">{{
                token.rawBalance | formatUsdAmount(token.tokenPrice, token.symbol)
              }}</span>
            </div>
          </div>
          <i-button class="_padding-y-0" link size="lg" variant="secondary" :to="`/withdraw?token=${symbol}`">- Withdraw </i-button>
        </div>
        <i-button block class="_margin-top-1" size="lg" variant="secondary" :to="`/transfer?token=${symbol}`"> <i class="ri-send-plane-fill" />&nbsp;&nbsp;Transfer </i-button>
      </div>
    </div>
    <transactions :filter="symbol" />
  </div>
</template>

<script lang="ts">
import transactions from "@/blocks/Transactions.vue";
import Vue from "vue";

export default Vue.extend({
  components: {
    transactions,
  },
  asyncData({ from }) {
    return {
      fromRoute: from,
    };
  },
  data() {
    return {
      token: {},
      loading: true,
    };
  },
  computed: {
    symbol() {
      return this.$route.params.symbol.toUpperCase();
    },
  },
  mounted() {
    this.getData();
  },
  methods: {
    getFormattedTotalPrice(price, amount, symbol) {
      return utils.getFormattedTotalPrice(price, amount, symbol);
    },
    async getData() {
      this.loading = true;
      const balances = await this.$store.dispatch("wallet/getzkBalances");
      let found = false;
      for (const item of balances) {
        if (item.symbol === this.symbol) {
          this.token = item;
          found = true;
          this.loading = false;
          break;
        }
      }
      if (!found) {
        await this.$router.push("/account");
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.balanceWithdraw {
  @media screen and (max-width: 768px) {
    flex-direction: column;

    & > .infoBlock {
      margin-bottom: 10px;
    }
  }
}
</style>
