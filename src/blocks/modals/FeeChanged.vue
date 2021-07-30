<template>
  <i-modal :value="value" size="md" @hide="close()">
    <template slot="header">Fee changed</template>
    <p>The price for zkSync transactions fluctuates a little bit to make sure that zkSync runs as close as possible to break-even costs.</p>
    <div class="successBlock _margin-top-1">
      <div v-for="(item, index) in changedFees" :key="index" class="infoBlockItem smaller" :class="{ '_margin-top-1': index === 2 }">
        <div class="headline">{{ item.headline }}:</div>
        <div class="amount">
          <span class="tokenSymbol">{{ item.symbol }}</span>
          {{ item.amount | formatToken(item.symbol) }}
          <span class="secondaryText">
            <token-price :symbol="item.symbol" :amount="item.amount" />
          </span>
        </div>
      </div>
    </div>
    <div v-if="canProceed" class="goBackContinueBtns _margin-top-1">
      <i-button
        size="lg"
        variant="secondary"
        circle
        @click="
          $emit('back');
          close();
        "
      >
        <v-icon name="ri-arrow-left-line" />
      </i-button>
      <i-button
        block
        size="lg"
        variant="secondary"
        @click="
          $emit('proceed');
          close();
        "
        >Proceed to {{ type }}</i-button
      >
    </div>
    <i-button
      v-else
      class="_margin-top-1"
      block
      size="lg"
      variant="secondary"
      @click="
        $emit('back');
        close();
      "
      >Ok</i-button
    >
  </i-modal>
</template>

<script lang="ts">
import { ZkInFeeChange } from "@/types/lib";
import Vue, { PropOptions } from "vue";

export default Vue.extend({
  props: {
    type: {
      type: String,
      default: "Transfer",
      required: false,
    },
    value: {
      type: Boolean,
      default: false,
      required: false,
    },
    canProceed: {
      type: Boolean,
      default: false,
      required: false,
    },
    changedFees: {
      type: Array,
      default: () => [],
      required: true,
    } as PropOptions<ZkInFeeChange[]>,
  },
  mounted() {
    console.log(this.changedFees);
  },
  methods: {
    close() {
      this.$emit("input", false);
    },
  },
});
</script>
