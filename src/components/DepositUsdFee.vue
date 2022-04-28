<template>
  <div class="depositUSDFee">
    <b>Fee:</b>
    <span v-if="depositFeeLoading">Loading...</span>
    <span v-else-if="depositFee && !depositFeeLoading">
      <token-price symbol="ETH" :amount="depositFee" />
    </span>
    <span v-else class="errorText"
      >Calculating fee error. <u class="_cursor-pointer" @click="getEstimatedDepositFee()">Try Again</u></span
    >
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import {
  ETH_RECOMMENDED_DEPOSIT_GAS_LIMIT,
  ERC20_DEPOSIT_GAS_LIMIT,
  ERC20_RECOMMENDED_DEPOSIT_GAS_LIMIT,
} from "zksync/build/utils";
import { Token } from "@matterlabs/zksync-nuxt-core/types";
import { AccountState, Address, Tokens, TokenSymbol } from "zksync/build/types";
import { RemoteWallet, Wallet } from "zksync";

export default Vue.extend({
  data() {
    return {
      depositFee: undefined as BigNumberish | undefined,
      gasPrice: undefined as BigNumber | undefined,
      depositFeeLoading: true,
      latestRequested: undefined as TokenSymbol | undefined,
    };
  },
  computed: {
    tokens(): Tokens | undefined {
      return this.$store.getters["zk-tokens/zkTokens"];
    },
    chosenToken(): Token | undefined {
      if (!this.tokens) {
        return;
      }
      return this.tokens[this.$store.getters["zk-transaction/symbol"]] as Token;
    },
    ownAddress(): Address {
      return this.$store.getters["zk-account/address"];
    },
    isMainnet(): boolean {
      return this.$store.getters["zk-provider/network"] === "mainnet";
    },
  },
  watch: {
    chosenToken: {
      immediate: true,
      handler() {
        this.getEstimatedDepositFee();
      },
    },
  },
  methods: {
    async getSelectedERC20DepositFee() {
      if (!this.chosenToken) {
        return;
      }
      const syncWallet: Wallet | RemoteWallet = this.$store.getters["zk-wallet/syncWallet"];
      const accountState: AccountState = this.$store.getters["zk-account/accountState"];
      const tokenAddress = this.chosenToken.address;
      const mainZkSyncContract = syncWallet.getZkSyncMainContract();
      const gasEstimate = await mainZkSyncContract.estimateGas
        .depositERC20(tokenAddress, "1000000000", this.ownAddress, {
          nonce: accountState.committed.nonce,
          gasPrice: this.gasPrice,
        })
        .then(
          (estimate) => estimate,
          () => BigNumber.from("0")
        );
      const recommendedGasLimit =
        this.isMainnet && ERC20_DEPOSIT_GAS_LIMIT[tokenAddress]
          ? BigNumber.from(ERC20_DEPOSIT_GAS_LIMIT[tokenAddress])
          : ERC20_RECOMMENDED_DEPOSIT_GAS_LIMIT;
      const gasLimit = gasEstimate.gte(recommendedGasLimit) ? gasEstimate : recommendedGasLimit;
      return this.gasPrice?.mul(gasLimit).toString();
    },
    getETHDepositFee() {
      const total = BigNumber.from(ETH_RECOMMENDED_DEPOSIT_GAS_LIMIT);
      return this.gasPrice?.mul(total).toString();
    },
    async getEstimatedDepositFee(): Promise<void> {
      try {
        const currentToken = !this.chosenToken ? "ETH" : this.chosenToken.symbol;
        if (this.latestRequested === currentToken) {
          return;
        }
        this.depositFeeLoading = true;
        this.latestRequested = currentToken;
        if (!this.gasPrice) {
          this.gasPrice = await this.$store.getters["zk-onboard/web3Provider"].getGasPrice();
        }
        if (currentToken === "ETH") {
          this.depositFee = this.getETHDepositFee();
        } else {
          this.depositFee = await this.getSelectedERC20DepositFee();
        }
      } catch (error) {
        this.depositFee = undefined;
        console.warn("Error calculating estimated deposit fee\n", error);
      }
      this.depositFeeLoading = false;
    },
  },
});
</script>
