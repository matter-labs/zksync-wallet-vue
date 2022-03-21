<template>
  <div class="walletPage dappPageWrapper">
    <div class="balancesBlock tileBlock">
      <h3 class="tileHeadline h3">
        Top&nbsp;up
      </h3>
      <section class="tileSubContainer">
        <h4 class="tileSmallHeadline">
          Buy Crypto with Credit Card
          <div class="secondaryText estimatedFee _text-nowrap">
            <v-icon name="la-charging-station-solid"/>
            <b>Fee:</b>&nbsp;~3-5%
          </div>
        </h4>
        <div class="secondaryText small _margin-bottom-05">
          You can buy crypto directly on zkSync with your credit card, just go through KYC process of our partners and enter your wallet address
        </div>
        <providers :show-providers="{ramp:true, banxa: true, moonpay: true, utorg: true}"/>
      </section>
      <div class="orDivider">
        <div class="line"></div>
        <div class="orText">or</div>
        <div class="line"></div>
      </div>
      <section class="tileSubContainer">
        <h4 class="tileSmallHeadline">
          Exchanges
          <div class="secondaryText estimatedFee">
            <v-icon name="la-charging-station-solid"/>
            <b>Fee:</b>&nbsp;~0.5%
          </div>
        </h4>
        <div class="secondaryText small _margin-bottom-05">
          zkSync v1 is integrated with exchanges, so you can withdraw funds from your favorite exchanges directly inside the zkSync network using the benefits of the low fees
        </div>
        <providers :show-providers="{okex: true, bybit: true}"/>
      </section>
      <div class="orDivider">
        <div class="line"></div>
        <div class="orText">or</div>
        <div class="line"></div>
      </div>
      <section class="tileSubContainer">
        <h4 class="tileSmallHeadline">
          Bridges
          <div class="secondaryText estimatedFee">
            <v-icon name="la-charging-station-solid"/>
            <b>Fee:</b>&nbsp;~1-90$
          </div>
        </h4>
        <div class="secondaryText small _margin-bottom-05">
          You can bridge your assets from other networks & exchanges using one of our supported bridges
        </div>
        <providers :show-providers="{layerSwap: true, zksync: true, orbiter: true}"/>
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { AccountState as WalletAccountState, TokenInfo } from "zksync/build/types";
import { ZkTokenBalances } from "@matterlabs/zksync-nuxt-core/types";
import { searchByKey } from "@matterlabs/zksync-nuxt-core/utils";
import BlockModalsBalanceInfo from "@/blocks/modals/BalanceInfo.vue";

export default Vue.extend({
  components: { BlockModalsBalanceInfo },
  data () {
    return {
      search: ""
    };
  },
  computed: {
    showSearching (): boolean {
      return this.isSearching && !this.hasDisplayedBalances;
    },
    showLoader (): boolean {
      return this.$store.getters["zk-account/accountStateLoading"] && !this.$store.getters["zk-account/accountStateRequested"];
    },
    emptyBalances (): boolean {
      return !this.isSearching && !this.hasDisplayedBalances && (!this.$store.getters["zk-account/accountStateLoading"] || this.$store.getters["zk-account/accountStateRequested"]);
    },
    accountStateLoading (): boolean {
      return this.$store.getters["zk-account/accountStateLoading"];
    },
    zkBalances (): ZkTokenBalances {
      return this.$store.getters["zk-balances/balances"];
    },
    zkBalancesWithDeposits (): ZkTokenBalances {
      const tokens = this.$store.getters["zk-tokens/zkTokens"] as TokenInfo[];
      const zkBalancesWithDeposits = this.zkBalances;
      for (const symbol in this.activeDeposits) {
        if (this.activeDeposits.hasOwnProperty(symbol) && !zkBalancesWithDeposits[symbol]) {
          zkBalancesWithDeposits[symbol] = {
            balance: "0", verified: false, feeAvailable: tokens[symbol] ? tokens[symbol].enabledForFees : false
          };
        }
      }
      return zkBalancesWithDeposits;
    },
    displayedList (): ZkTokenBalances {
      return searchByKey(this.zkBalancesWithDeposits, this.search);
    },
    activeDeposits (): WalletAccountState {
      return this.$store.getters["zk-balances/depositingBalances"];
    },
    hasDisplayedBalances (): boolean {
      return Object.keys(this.displayedList).length !== 0 || Object.keys(this.activeDeposits).length !== 0;
    },
    zigZagLink (): string | null {
      switch (this.$store.getters["zk-provider/network"]) {
        case "mainnet":
          return "https://trade.zigzag.exchange/";
        case "rinkeby":
          return "https://trade.zigzag.exchange/?network=zksync-rinkeby";
        default:
          return null;
      }
    },
    isSearching (): boolean {
      return this.search.trim().length > 0;
    }
  },
  mounted () {
    this.$analytics.track("visit_home");
  },
  methods: {
    openAccountModal (): void {
      this.$accessor.setAccountModalState(true);
    },
    openBalanceInfoModal (): void {
      this.$accessor.openModal("BalanceInfo");
    }
  }
});
</script>
<style lang="scss">
.tileSubContainer {
  h4.tileSmallHeadline {
    font-weight: 700;
    font-size: 16px;
    line-height: 22px;
    margin: 0 0 1rem;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
  }
}

.dappPageWrapper {
  .estimatedFee {
    margin: 3px 0;
  }

  .orDivider {
    width: 100%;
    height: max-content;
    display: grid;
    grid-template-columns: 1fr max-content 1fr;
    grid-template-rows: 100%;
    grid-gap: 17px;
    align-items: center;
    padding: 23px 0;

    .line {
      width: 100%;
      height: 1px;
      background-color: #eeeeee;
      transition: background-color $transition1;
      will-change: background-color;
    }

    .orText {
      font-size: 18px;
      font-weight: 700;
      color: #eeeeee;
      text-align: center;
      transition: color $transition1;
      will-change: color;
    }
  }
}

.inkline.-dark {
  .dappPageWrapper {
    .tileSmallHeadline {
      color: $white;
    }

    .orDivider {
      .line {
        background-color: transparentize($color: $gray, $amount: 0.5);
      }

      .orText {
        color: transparentize($color: $gray, $amount: 0.3);
      }
    }
  }
}

</style>