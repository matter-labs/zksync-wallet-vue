<template>
  <div class="transactionBlock">
    <block-modals-allowance />

    <!-- Choose token -->
    <i-modal v-model="chooseTokenModal" size="md">
      <template slot="header">Choose token</template>
      <choose-token :tokens-type="mainToken" @chosen="chooseToken($event)" />
    </i-modal>

    <!-- Main Block -->
    <div v-if="activeTransaction && activeTransaction.step !== 'initial'">
      <block-loading-block v-if="activeTransaction.step !== 'finished'" />
      <block-success-block v-else />
    </div>
    <div v-else class="transactionTile tileBlock">
      <div class="tileHeadline withBtn h3">
        <nuxt-link class="_icon-wrapped -rounded -sm returnBtn _display-flex" :to="routeBack">
          <v-icon name="ri-arrow-left-line" scale="1" />
        </nuxt-link>
        <div>{{ type }}</div>
      </div>

      <div class="_padding-top-1 inputLabel">Amount</div>
      <amount-input
        ref="amountInput"
        v-model="inputtedAmount"
        :max-amount="maxAmount.toString()"
        :token="chosenToken ? chosenToken : undefined"
        autofocus
        :type="type"
        @chooseToken="chooseTokenModal = true"
        @enter="commitTransaction()"
      />

      <div v-if="chosenToken && displayTokenUnlock">
        <div class="_padding-top-1 _display-flex _align-items-center inputLabel" @click="$accessor.openModal('Allowance')">
          <span>
            <span class="tokenSymbol">{{ chosenToken }}</span> Allowance
          </span>
          <div class="iconInfo">
            <v-icon name="ri-question-mark" />
          </div>
        </div>
        <div class="grid-cols-2-layout">
          <!-- :class="{ 'single-col': singleColumnButtons }" -->
          <i-button data-cy="approve_unlimited_button" block size="md" variant="secondary" @click="unlockToken(true)">
            Approve unlimited <span class="tokenSymbol">{{ chosenToken }}</span>
          </i-button>
          <i-button
            v-if="inputtedAmount && amountBigNumber"
            key="approveAmount"
            data-cy="approve_button"
            block
            class="_margin-top-0"
            size="md"
            variant="secondary"
            @click="unlockToken(false)"
          >
            Approve {{ amountBigNumber | parseBigNumberish(chosenToken) }} <span class="tokenSymbol">{{ chosenToken }}</span>
          </i-button>
          <i-button v-else key="noApproveAmount" block class="_margin-top-0" size="md" disabled>
            Introduce <span class="tokenSymbol">{{ chosenToken }}</span> amount
          </i-button>
        </div>
        <p class="_text-center _margin-top-05">
          <span v-if="zeroAllowance">
            You should firstly approve selected token in order to authorize deposits for
            <span class="tokenSymbol">{{ chosenToken }}</span>
          </span>
          <span v-else>
            You do not have enough allowance for
            <span class="tokenSymbol">{{ chosenToken }}</span>
            .<br class="desktopOnly" />
            Set higher allowance to proceed to deposit.
            <span v-if="allowance">
              <br class="desktopOnly" />Your current allowance is
              <span class="linkText" @click="setAllowanceMax()">
                {{ allowance | parseBigNumberish(chosenToken) }} <span class="tokenSymbol">{{ chosenToken }}</span>
              </span>
            </span>
          </span>
        </p>
      </div>

      <div v-if="error" class="errorText _text-center _margin-top-1">{{ error }}</div>

      <i-button
        :disabled="!commitAllowed"
        block
        class="_margin-top-1 _display-flex flex-row"
        data-cy="commit_transaction_button"
        size="lg"
        variant="secondary"
        @click="commitTransaction()"
      >
        <div class="_display-flex _justify-content-center _align-items-center">
          <div>{{ type }}</div>
          <loader v-if="allowanceLoading" class="_margin-left-1" size="xs" />
        </div>
      </i-button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropOptions } from "vue";
import { ZkTransactionMainToken, ZkTransactionType, ZkActiveTransaction } from "matter-dapp-ui/types";
import { TokenLike } from "zksync/build/types";
import { Route } from "vue-router/types";
import { BigNumber } from "@ethersproject/bignumber";
export default Vue.extend({
  props: {
    fromRoute: {
      required: false,
      type: Object,
      default: () => {},
    } as PropOptions<Route>,
  },
  data() {
    return {
      inputtedAmount: this.$store.getters["zk-transaction/amount"],
      chooseTokenModal: false,
    };
  },
  computed: {
    routeBack(): Route | string {
      if (this.fromRoute && this.fromRoute.fullPath !== this.$route.fullPath) {
        return this.fromRoute;
      } else if (this.mainToken === "L2-NFT") {
        return "/account/nft";
      }
      return "/account";
    },
    type(): ZkTransactionType {
      return this.$store.getters["zk-transaction/type"];
    },
    mainToken(): ZkTransactionMainToken {
      return this.$store.getters["zk-transaction/mainToken"];
    },
    chosenToken(): TokenLike {
      return this.$store.getters["zk-transaction/symbol"];
    },
    commitAllowed(): boolean {
      return this.$store.getters["zk-transaction/commitAllowed"];
    },
    error(): Error {
      return this.$store.getters["zk-transaction/error"];
    },
    amountBigNumber(): BigNumber | undefined {
      return this.$store.getters["zk-transaction/amountBigNumber"];
    },
    zeroAllowance(): boolean {
      if (!this.chosenToken) {
        return false;
      }
      this.$store.getters["zk-balances/tokensAllowanceForceUpdate"];
      const tokenAllowance: BigNumber | undefined = this.$store.getters["zk-balances/tokenAllowance"](this.chosenToken);
      if (!tokenAllowance) {
        return false;
      }
      return tokenAllowance.eq("0");
    },
    maxAmount(): BigNumber {
      if (!this.chosenToken) {
        return BigNumber.from("0");
      }
      const tokenEthereumBalance: BigNumber | undefined = this.$store.getters["zk-balances/ethereumBalance"](this.chosenToken);
      if (!tokenEthereumBalance) {
        return BigNumber.from("0");
      }
      return tokenEthereumBalance;
    },
    allowance(): BigNumber | undefined {
      this.$store.getters["zk-balances/tokensAllowanceForceUpdate"];
      return this.$store.getters["zk-balances/tokenAllowance"](this.chosenToken);
    },
    enoughAllowance(): boolean {
      return this.$store.getters["zk-transaction/enoughAllowance"];
    },
    allowanceLoading(): boolean {
      this.$store.getters["zk-balances/tokensAllowanceForceUpdate"];
      if (this.type === "Deposit" && this.chosenToken !== undefined) {
        return !!this.$store.getters["zk-balances/tokensAllowanceLoading"][this.chosenToken];
      }
      return false;
    },
    displayTokenUnlock(): boolean {
      return this.type === "Deposit" && this.chosenToken !== undefined && (!this.enoughAllowance || this.zeroAllowance) && (!this.allowanceLoading || this.zeroAllowance);
    },
    activeTransaction(): ZkActiveTransaction {
      return this.$store.getters["zk-transaction/activeTransaction"];
    },
  },
  watch: {
    inputtedAmount(val) {
      this.$store.commit("zk-transaction/setAmount", val);
    },
  },
  methods: {
    async chooseToken(token: TokenLike) {
      this.chooseTokenModal = false;
      await this.$store.dispatch("zk-transaction/setSymbol", token);
    },
    async commitTransaction() {
      if (!this.commitAllowed) {
        return;
      }
      await this.$store.dispatch("zk-transaction/commitTransaction");
    },
    async unlockToken(unlimited = false) {
      await this.$store.dispatch("zk-transaction/setAllowance", unlimited);
    },
    setAllowanceMax() {
      this.inputtedAmount = this.$options.filters!.parseBigNumberish(this.allowance, this.chosenToken);
    },
  },
});
</script>
