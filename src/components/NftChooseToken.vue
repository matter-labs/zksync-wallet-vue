<template>
  <div class="nftTokenInput">
    <i-modal v-model="chooseTokenModal" size="md">
      <template slot="header">Choose token</template>
      <block-choose-token
        tokens-type="NFT"
        @chosen="
          $emit('input', $event);
          chooseTokenModal = false;
        "
      />
    </i-modal>
    <i-input :value="textValue" disabled size="lg" type="text">
      <i-button slot="append" block link variant="secondary" @click="chooseTokenModal = true"> Select NFT</i-button>
    </i-input>
  </div>
</template>

<script lang="ts">
import { ZkInNFT } from "@/types/lib";
import Vue, { PropOptions } from "vue";

export default Vue.extend({
  props: {
    value: {
      type: [Boolean, Object],
      required: false,
      default: undefined,
    } as PropOptions<false | ZkInNFT>,
  },
  data() {
    return {
      chooseTokenModal: false,
    };
  },
  computed: {
    textValue(): string {
      if (this.value) {
        return this.value.symbol;
      }
      return "";
    },
  },
});
</script>
