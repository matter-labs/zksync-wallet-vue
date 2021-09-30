<template>
  <i-modal v-model="chooseTokenModalOpened" size="md" data-cy="fee_changed_modal">
    <template slot="header">Fee changed</template>
    <p>The price for zkSync transactions fluctuates a little bit to make sure that zkSync runs as close as possible to break-even costs.</p>
    <div class="successBlock _margin-top-1">
      <div v-for="(item, key, index) in changedFees" :key="key" class="infoBlockItem smaller" :class="{ '_margin-top-1': index > 1 }">
        <div class="headline">{{ getFeeName(key) }}:</div>
        <div class="amount">
          <span class="tokenSymbol">{{ item.symbol }}</span>
          {{ item.amount.toString() | parseBigNumberish(item.symbol) }}
          <span class="secondaryText">
            <token-price :symbol="item.symbol" :amount="item.amount.toString()" />
          </span>
        </div>
      </div>
    </div>
    <div v-if="canProceed" class="goBackContinueBtns _margin-top-1">
      <i-button size="lg" variant="secondary" circle @click="proceed(false)">
        <v-icon name="ri-arrow-left-line" />
      </i-button>
      <i-button data-cy="fee_changed_proceed_button" block size="lg" variant="secondary" @click="proceed(true)">Proceed to {{ typeName }}</i-button>
    </div>
    <i-button v-else class="_margin-top-1" block size="lg" variant="secondary" @click="proceed(false)">Ok</i-button>
  </i-modal>
</template>

<script lang="ts">
import Vue from "vue";
import { ZkFeesChange } from "matter-dapp-module/types";

export default Vue.extend({
  props: {
    typeName: {
      type: String,
      default: "Transfer",
      required: false,
    },
  },
  computed: {
    changedFees(): ZkFeesChange | undefined {
      return this.$store.getters["zk-transaction/feesChange"];
    },
    canProceed(): boolean {
      return this.$store.getters["zk-transaction/commitAllowed"];
    },
    chooseTokenModalOpened: {
      get(): boolean {
        return !!this.changedFees;
      },
      set(value) {
        if (!value) {
          this.proceed(!!value);
        }
      },
    },
  },
  methods: {
    async proceed(result: boolean) {
      await this.$store.dispatch("zk-transaction/feesChangeProceed", result);
    },
    getFeeName(key: string) {
      switch (key) {
        case "txFee":
          return `New ${this.typeName} fee`;
        case "accountActivation":
          return "New Account Activation fee";

        default:
          return "";
      }
    },
  },
});
</script>
