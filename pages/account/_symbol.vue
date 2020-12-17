<template>
    <div class="tokenAccount">
        <div class="tileBlock">
            <div class="tileHeadline h3">
                <span>{{symbol}}</span>
                <i-tooltip>
                    <i class="fas fa-times" @click="$router.push('/account')"></i>
                    <template slot="body">Close</template>
                </i-tooltip>
            </div>
            <div v-if="loading">
                <i-loader class="_display-block _margin-x-auto _margin-y-3" size="md" :variant="$inkline.config.variant === 'light' ? 'dark' : 'light'" />
            </div>
            <div v-else>
                <div class="infoBlock">
                    <div class="headline">Token price:</div>
                    <div>${{token.tokenPrice.toFixed(2)}}</div>
                </div>
                <div class="infoBlock _margin-top-1">
                    <div class="headline">Your balance:</div>
                </div>
                <div class="_display-flex _justify-content-space-between">
                    <div class="infoBlock">
                        <div class="balance">{{symbol}} {{token.balance}}&nbsp;&nbsp;<span class="balancePrice">~${{(token.tokenPrice*token.balance).toFixed(2)}}</span></div>
                    </div>
                    <i-button class="_padding-y-0" link size="lg" variant="secondary" to="/withdraw">- Withdraw</i-button>
                </div>
                <i-button block class="_margin-top-1" size="lg" variant="secondary" to="/transfer"><i class="fal fa-paper-plane"></i>&nbsp;&nbsp;Transfer</i-button>
            </div>
        </div>
        <transactions />
    </div>
</template>

<script>
import transactions from "@/blocks/Transactions.vue";
export default {
  components: {
    transactions,
  },
  data() {
    return {
      token: {},
      loading: true,
    };
  },
  computed: {
    symbol: function () {
      return this.$route.params.symbol.toUpperCase();
    },
  },
  mounted() {
    this.getData();
  },
  methods: {
    getData: async function () {
      this.loading = true;
      const balances = await this.$store.dispatch("wallet/getzkBalances");
      let found = false;
      for (let a = 0; a < balances.length; a++) {
        if (balances[a].symbol === this.symbol) {
          this.token = balances[a];
          found = true;
          this.loading = false;
          break;
        }
      }
      if (found === false) {
        await this.$router.push("/account");
      }
    },
  },
};
</script>
