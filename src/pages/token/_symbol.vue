<template>
  <div class="tokenAccount dappPageWrapper">
    <div class="tileBlock _margin-bottom-0">
      <div class="tileHeadline withBtn h3">
        <nuxt-link :to="returnLink" class="returnBtn">
          <v-icon name="ri-arrow-left-line" />
        </nuxt-link>
        <div class="_display-flex _align-items-center _justify-content-center">
          <span class="tokenSymbol">{{ symbol }}</span>
          <i-tooltip v-if="displayTokenTooltip">
            <a :href="blockExplorerLink + '/token/' + token.address" target="_blank" class="icon-container _display-flex">
              <v-icon name="ri-external-link-line" class="iconInfo" />
            </a>
            <template slot="body">Token contract</template>
          </i-tooltip>
        </div>
      </div>
      <div v-if="tokenNotFound" class="tokenNotFound errorText">Token not found</div>
      <div v-else>
        <div class="infoBlock">
          <div class="headline">Token price:</div>
          <div v-if="zkTokensLoading" class="secondaryText">Loading...</div>
          <div v-else class="balancePrice">
            <token-price :symbol="symbol" :amount="'1'.padEnd(token.decimals + 1, '0')" />
          </div>
        </div>
        <div v-if="zkTokensLoading" class="infoBlock _display-flex _margin-top-1">
          <div class="headline">Allowed for paying fees:</div>
          <div class="secondaryText _margin-left-05">Loading...</div>
        </div>
        <div v-else class="infoBlock _display-flex _margin-top-1">
          <div class="balancePrice">{{ feeAcceptable }} for paying fees</div>
        </div>
        <div class="infoBlock _margin-top-1">
          <div class="headline">Your balance:</div>
        </div>
        <div class="_display-flex _justify-content-space-between _flex-wrap balanceWithdraw">
          <div class="infoBlock">
            <div v-if="accountStateLoading && !accountStateRequested && !balanceToken" class="secondaryText">Loading...</div>
            <div v-else-if="balanceToken" class="balance">
              {{ balanceToken.balance | parseBigNumberish(symbol) }}&nbsp;
              <span class="tokenSymbol">{{ symbol }}&nbsp;&nbsp;</span>
              <token-price class="secondaryText" :symbol="symbol" :amount="balanceToken.balance" />
            </div>
            <div v-else class="balance">
              <span class="tokenSymbol">{{ symbol }}</span>
              &nbsp;0&nbsp;&nbsp;
              <token-price :symbol="symbol" amount="0" />
            </div>
          </div>
          <i-button class="_padding-y-0" link size="sm" variant="secondary" :to="`/transaction/withdraw?token=${symbol}`">Send to Ethereum (L1)</i-button>
        </div>
        <i-button block class="_margin-top-1" size="lg" variant="secondary" :to="`/transaction/transfer?token=${symbol}`">
          <v-icon class="planeIcon" name="ri-send-plane-fill" />&nbsp;&nbsp;Transfer
        </i-button>
      </div>
    </div>
    <transactions class="_margin-top-0" :token="symbol" />
  </div>
</template>

<script lang="ts">
import { Token, ZkTokenBalance } from "@matterlabs/zksync-nuxt-core/types";
import Vue from "vue";
import { Route } from "vue-router/types";
import { TokenSymbol } from "zksync/build/types";

export default Vue.extend({
  asyncData({ from, redirect, params }) {
    if (!params.symbol) {
      return redirect("/account");
    }
    return {
      fromRoute: from,
    };
  },
  data() {
    return {
      fromRoute: <undefined | Route>undefined,
    };
  },
  computed: {
    returnLink(): string | Route {
      return this.fromRoute && this.fromRoute.fullPath !== this.$route.fullPath && this.fromRoute.path !== "/withdraw" ? this.fromRoute : "/account";
    },
    symbol(): TokenSymbol {
      return this.$route.params.symbol;
    },
    token(): Token {
      return this.$store.getters["zk-tokens/zkTokens"][this.symbol];
    },
    zkTokensLoading(): boolean {
      return this.$store.getters["zk-tokens/zkTokensLoading"];
    },
    tokenNotFound(): boolean {
      return !this.zkTokensLoading && !this.token;
    },
    accountStateRequested(): boolean {
      return this.$store.getters["zk-account/accountStateRequested"];
    },
    feeAcceptable(): string {
      return this.token && this.token.enabledForFees ? "Available" : "Not available";
    },
    balanceToken(): ZkTokenBalance {
      return this.$store.getters["zk-balances/balances"][this.symbol];
    },
    accountStateLoading(): boolean {
      return this.$store.getters["zk-account/accountStateLoading"];
    },
    displayTokenTooltip(): boolean {
      return !this.zkTokensLoading && this.token && this.symbol !== "ETH";
    },
    blockExplorerLink(): string {
      return this.$store.getters["zk-onboard/config"].ethereumNetwork.explorer;
    },
  },
  mounted() {
    this.$analytics.track("visit_token_history");
  },
});
</script>
