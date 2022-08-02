<template>
  <div class="walletPage dappPageWrapper">
    <div class="balancesBlock tileBlock">
      <h3 class="tileHeadline h3">
        Balances in L2
        <v-icon
          id="questionMark"
          class="icon-container _display-flex iconInfo"
          name="ri-question-mark"
          scale="0.9"
          @click.native="openBalanceInfoModal"
        />
      </h3>

      <wallet-address
        :wallet="$store.getters['zk-account/address']"
        class="clickablePicture _margin-bottom-1"
        @clickPicture="openAccountModal"
      />

      <div v-if="emptyBalances" class="centerBlock">
        <p class="tileText">
          No balances yet, please
          <nuxt-link to="/account/top-up">top your wallet up</nuxt-link>
          or <a href="#" @click.prevent="openAccountModal">share your zk-address</a> to receive a transfer from someone!
        </p>
        <i-button
          block
          class="_margin-top-1"
          data-cy="account_deposit_button"
          size="lg"
          to="/account/top-up"
          variant="secondary"
        >
          <v-icon class="planeIcon" name="ri-add-fill" />&nbsp;Top&nbsp;up
        </i-button>
      </div>
      <div v-else class="balances">
        <template v-if="!showLoader">
          <div class="_display-flex _justify-content-space-between balancesButtonGroup _margin-y-1">
            <i-button
              block
              class="_margin-y-0 _margin-right-1 _padding-right-2"
              data-cy="account_deposit_button"
              size="md"
              to="/account/top-up"
              variant="secondary"
            >
              <v-icon class="planeIcon" name="ri-add-fill" />&nbsp;Top&nbsp;up
            </i-button>
            <i-button
              block
              class="_margin-y-0 _padding-right-1 _margin-right-1"
              data-cy="account_send_zksync_button"
              size="md"
              to="/account/transfer"
              variant="secondary"
            >
              <v-icon class="planeIcon" name="ri-send-plane-fill" />&nbsp;Transfer
            </i-button>
            <i-button
              :disabled="!zigZagLink"
              :href="zigZagLink"
              block
              class="_margin-y-0 _padding-right-1"
              data-cy="account_swap_zksync_button"
              size="md"
              tag="a"
              target="_blank"
              variant="secondary"
            >
              <v-icon class="planeIcon" name="ri-arrow-left-right-line" />&nbsp;Swap
            </i-button>
          </div>

          <i-input ref="searchInput" v-model="search" autofocus maxlength="6" placeholder="Filter tokens">
            <template #prefix>
              <v-icon name="ri-search-line" />
            </template>
          </i-input>
        </template>

        <div v-if="showLoader" class="centerBlock">
          <loader />
        </div>
        <div v-else-if="showSearching" class="centerBlock">
          <span>
            Your search <strong>"{{ search }}"</strong> did not match any tokens
          </span>
        </div>
        <div v-else class="balancesList">
          <nuxt-link v-for="(item, symbol) in displayedList" :key="symbol" :to="`/token/${symbol}`" class="balanceItem">
            <div class="leftSide _display-flex _align-items-center">
              <div class="tokenSymbol">
                {{ symbol }}
              </div>
              <div class="status _margin-left-05 _hidden-md-and-up">
                <v-icon
                  :class="{ committed: !item.verified, verified: item.verified }"
                  :name="item.verified ? 'ri-check-double-line' : 'ri-check-line'"
                />
              </div>
            </div>
            <div class="rightSide">
              <div class="rowItem">
                <div class="total">
                  <span class="balancePrice">
                    <token-price :amount="item.balance" :symbol="symbol" />
                  </span>
                  &nbsp;&nbsp;{{ item.balance | parseBigNumberish(symbol) }}
                </div>
                <div class="status _hidden-sm-and-down">
                  <i-tooltip placement="left">
                    <v-icon
                      :class="{ committed: !item.verified, verified: item.verified }"
                      :name="item.verified ? 'ri-check-double-line' : 'ri-check-line'"
                    />
                    <template #body>{{ item.verified ? "Verified" : "Committed" }}</template>
                  </i-tooltip>
                </div>
              </div>
              <div v-if="activeDeposits[symbol]" class="rowItem">
                <div class="total small">
                  <span class="balancePrice">
                    Depositing:
                    <token-price :amount="activeDeposits[symbol].amount" :symbol="symbol" />
                  </span>
                  &nbsp;&nbsp;+{{ activeDeposits[symbol].amount | parseBigNumberish(symbol) }}
                </div>
                <div class="status">
                  <loader size="xs" />
                </div>
              </div>
            </div>
          </nuxt-link>
        </div>
      </div>
    </div>
    <block-modals-balance-info />
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
  data() {
    return {
      search: "",
    };
  },
  computed: {
    showSearching(): boolean {
      return this.isSearching && !this.hasDisplayedBalances;
    },
    showLoader(): boolean {
      return (
        this.$store.getters["zk-account/accountStateLoading"] &&
        !this.$store.getters["zk-account/accountStateRequested"]
      );
    },
    emptyBalances(): boolean {
      return (
        !this.isSearching &&
        !this.hasDisplayedBalances &&
        (!this.$store.getters["zk-account/accountStateLoading"] ||
          this.$store.getters["zk-account/accountStateRequested"])
      );
    },
    accountStateLoading(): boolean {
      return this.$store.getters["zk-account/accountStateLoading"];
    },
    zkBalances(): ZkTokenBalances {
      return this.$store.getters["zk-balances/balances"];
    },
    zkBalancesWithDeposits(): ZkTokenBalances {
      const tokens = this.$store.getters["zk-tokens/zkTokens"] as TokenInfo[];
      const zkBalancesWithDeposits = this.zkBalances;
      for (const symbol in this.activeDeposits) {
        if (!zkBalancesWithDeposits[symbol]) {
          zkBalancesWithDeposits[symbol] = {
            balance: "0",
            verified: false,
            feeAvailable: tokens[symbol] ? tokens[symbol].enabledForFees : false,
          };
        }
      }
      return zkBalancesWithDeposits;
    },
    displayedList(): ZkTokenBalances {
      return searchByKey(this.zkBalancesWithDeposits, this.search);
    },
    activeDeposits(): WalletAccountState {
      return this.$store.getters["zk-balances/depositingBalances"];
    },
    hasDisplayedBalances(): boolean {
      return Object.keys(this.displayedList).length !== 0 || Object.keys(this.activeDeposits).length !== 0;
    },
    zigZagLink(): string | null {
      switch (this.$store.getters["zk-provider/network"]) {
        case "mainnet":
          return "https://trade.zigzag.exchange/";
        default:
          return null;
      }
    },
    isSearching(): boolean {
      return this.search.trim().length > 0;
    },
  },
  mounted() {
    this.$analytics.track("visit_home");
  },
  methods: {
    openAccountModal(): void {
      this.$accessor.setAccountModalState(true);
    },
    openBalanceInfoModal(): void {
      this.$accessor.openModal("BalanceInfo");
    },
  },
});
</script>
