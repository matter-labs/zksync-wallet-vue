<template>
  <div class="tokenAccount dappPageWrapper">
    <div class="tileBlock _margin-bottom-0">
      <div class="tileHeadline withBtn h3">
        <nuxt-link :to="fromRoute && fromRoute.fullPath !== $route.fullPath && fromRoute.path !== '/withdraw' ? fromRoute : '/account'" class="returnBtn">
          <v-icon name="ri-arrow-left-line" />
        </nuxt-link>
        <span class="tokenSymbol">{{ symbol }}</span>
      </div>
      <div v-if="loading">
        <loader class="_display-block _margin-x-auto _margin-y-3" />
      </div>
      <div v-else>
        <div class="infoBlock">
          <div class="headline">Token price:</div>
          <div class="balancePrice">
            <token-price :symbol="token.symbol" :amount="1" />
          </div>
        </div>
        <div class="infoBlock _margin-top-1">
          <div class="headline">Your balance:</div>
        </div>
        <div class="_display-flex _justify-content-space-between balanceWithdraw">
          <div class="infoBlock">
            <div class="balance">
              <span class="tokenSymbol">{{ symbol }}</span>
              &nbsp;{{ token.balance }}&nbsp;&nbsp;
              <token-price :symbol="token.symbol" :amount="token.rawBalance.toString()" />
            </div>
          </div>
          <i-button class="_padding-y-0" link size="lg" variant="secondary" :to="`/withdraw?token=${symbol}`">- Withdraw</i-button>
        </div>
        <i-button block class="_margin-top-1" size="lg" variant="secondary" :to="`/transfer?token=${symbol}`">
          <v-icon class="planeIcon" name="ri-send-plane-fill" />&nbsp;&nbsp;Transfer
        </i-button>
      </div>
    </div>
    <transactions class="_margin-top-0" :filter="symbol" />
  </div>
</template>

<script lang="ts">
import { ZkInBalance } from "@/types/lib";
import Vue from "vue";
import { TokenSymbol } from "zksync/build/types";

export default Vue.extend({
  asyncData({ from }) {
    return {
      fromRoute: from,
    };
  },
  data() {
    return {
      token: <ZkInBalance>{},
      loading: true,
    };
  },
  computed: {
    symbol(): TokenSymbol {
      return this.$route.params.symbol.toUpperCase();
    },
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData() {
      this.loading = true;
      const balances = await this.$accessor.wallet.requestZkBalances({ accountState: undefined, force: false });
      let found = false;
      for (const item of balances.balances) {
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
