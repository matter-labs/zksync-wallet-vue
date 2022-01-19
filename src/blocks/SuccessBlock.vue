<template>
  <div class="successBlock tileBlock">
    <div class="tileHeadline h3">
      <span>{{ activeTransaction.type }}</span>
    </div>
    <checkmark />
    <p class="_text-center _margin-top-0">
      <template v-if="activeTransaction.type === 'Deposit'">
        Your deposit transaction has been mined and will be processed after required number of confirmations.<br />Use the transaction link to track the progress.
      </template>
      <template v-else-if="activeTransaction.type === 'Allowance' && activeTransaction.data">
        Token <span class="tokenSymbol">{{ activeTransaction.data.token }}</span> was successfully approved
        <span v-if="activeTransaction.data.allowance.lt(unlimitedUnlockAmount)">
          for {{ activeTransaction.data.allowance.toString() | parseBigNumberish(activeTransaction.data.token) }}
          <span class="tokenSymbol">{{ activeTransaction.data.token }}</span>
        </span>
        <br />
        Now you can proceed to deposit.
      </template>
    </p>
    <a v-if="txLink" :href="txLink" class="_display-block _text-center _margin-top-1" target="_blank">Link to the transaction <v-icon name="ri-external-link-line"></v-icon></a>
    <div v-if="activeTransaction.address" class="infoBlockItem smaller _margin-top-2">
      <div class="amount">
        <span>Recipient:</span>
        <span v-if="isOwnAddress" class="secondaryText">Own account</span>
        <span v-else-if="openedContact" class="secondaryText">{{ openedContact.name }}</span>
      </div>
      <wallet-address :wallet="activeTransaction.address" />
    </div>
    <div v-if="activeTransaction.amount" class="infoBlockItem _margin-top-1">
      <div class="headline">Amount:</div>
      <div class="amount">
        <span v-if="typeof activeTransaction.token === 'string'">
          <span class="tokenSymbol">{{ activeTransaction.token }}</span>
          {{ activeTransaction.amount | parseBigNumberish(activeTransaction.token) }}
          <span class="secondaryText">
            <token-price :symbol="activeTransaction.token" :amount="activeTransaction.amount" />
          </span>
        </span>
        <span v-else>NFT-{{ activeTransaction.token }}</span>
      </div>
    </div>
    <div v-if="activeTransaction.fee" class="infoBlockItem smaller _margin-top-1">
      <div class="headline">Fee:</div>
      <div class="amount">
        <span class="tokenSymbol">{{ activeTransaction.feeToken }}</span>
        {{ activeTransaction.fee | parseBigNumberish(activeTransaction.feeToken) }}
        <span class="secondaryText">
          <token-price :symbol="activeTransaction.feeToken" :amount="activeTransaction.fee" />
        </span>
      </div>
    </div>
    <div v-if="activeTransaction.type === 'Allowance' && type === 'Deposit' && commitAllowed" slot="custom">
      <div class="border-line _margin-top-1"></div>
      <div class="infoBlockItem smaller _margin-top-1">
        <div class="headline">Amount to deposit:</div>
        <div class="amount">
          <span class="tokenSymbol">{{ chosenToken }}</span>
          {{ amountBigNumber.toString() | parseBigNumberish(chosenToken) }}
          <span class="secondaryText">
            <token-price :symbol="chosenToken" :amount="amountBigNumber.toString()" />
          </span>
        </div>
      </div>
      <div class="goBackContinueBtns _margin-top-1">
        <i-button data-cy="deposit_arrow_back_button" size="lg" variant="secondary" circle @click="clearActiveTransaction()">
          <v-icon name="ri-arrow-left-line" />
        </i-button>
        <i-button data-cy="deposit_proceed_to_deposit_button" block size="lg" variant="secondary" @click="commitTransaction()">Proceed to deposit</i-button>
      </div>
    </div>
    <i-button
      v-else-if="activeTransaction.type === 'Allowance' && type === 'Deposit'"
      data-cy="success_unlock_ok_button"
      block
      size="lg"
      variant="secondary"
      class="_margin-top-2"
      @click="clearActiveTransaction()"
    >
      Ok
    </i-button>
    <i-button v-else data-cy="success_block_ok_button" block size="lg" variant="secondary" class="_margin-top-2" :to="continueBtnLink">Ok</i-button>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { BigNumber } from "ethers";
import { getAddress } from "ethers/lib/utils";
import { ZkActiveTransaction, ZkContact, ZkConfig, ZkTransactionType } from "@matterlabs/zksync-nuxt-core/types";
import { TokenLike } from "zksync/build/types";
import { ERC20_APPROVE_TRESHOLD } from "zksync/build/utils";

export default Vue.extend({
  data() {
    return {
      displayAllowanceDeposit: false,
    };
  },
  computed: {
    config(): ZkConfig {
      return this.$store.getters["zk-onboard/config"];
    },
    activeTransaction(): ZkActiveTransaction {
      return this.$store.getters["zk-transaction/activeTransaction"];
    },
    txLink(): string | undefined {
      if (!this.activeTransaction.txHash) {
        return undefined;
      }
      switch (this.activeTransaction.type) {
        case "Mint":
        case "Allowance":
        case "Deposit":
          return this.config.ethereumNetwork.explorer + "tx/" + this.activeTransaction.txHash;

        default:
          return this.config.zkSyncNetwork.explorer + "explorer/transactions/" + this.activeTransaction.txHash;
      }
    },
    isOwnAddress(): boolean {
      return getAddress(this.$store.getters["zk-account/address"]) === getAddress(this.activeTransaction.address || "");
    },
    openedContact(): ZkContact {
      return this.$store.getters["zk-contacts/contactByAddress"](this.activeTransaction.address);
    },
    continueBtnLink(): string {
      switch (this.activeTransaction.type) {
        case "MintNFT":
        case "TransferNFT":
        case "WithdrawNFT":
          return "/account/nft";

        default:
          return "/account";
      }
    },
    amountBigNumber(): BigNumber | undefined {
      return this.$store.getters["zk-transaction/amountBigNumber"];
    },
    type(): ZkTransactionType {
      return this.$store.getters["zk-transaction/type"];
    },
    chosenToken(): TokenLike {
      return this.$store.getters["zk-transaction/symbol"];
    },
    commitAllowed(): boolean {
      return this.$store.getters["zk-transaction/commitAllowed"];
    },
    unlimitedUnlockAmount(): BigNumber {
      return ERC20_APPROVE_TRESHOLD;
    },
  },
  methods: {
    async commitTransaction() {
      if (!this.commitAllowed) {
        return;
      }
      await this.$store.dispatch("zk-transaction/commitTransaction", { requestFees: false });
    },
    async clearActiveTransaction() {
      await this.$store.commit("zk-transaction/clearActiveTransaction");
    },
  },
});
</script>
