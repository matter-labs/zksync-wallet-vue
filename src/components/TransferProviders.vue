<template>
  <div class="cryptoProviders transfer">
    <transfer-providers-zk-sync v-if="providers.includes('zksync')" class="providerOption" @providerError="setError" />
    <transfer-providers-ethereum
      v-if="providers.includes('ethereum')"
      class="providerOption"
      @providerError="setError"
    />

    <block-modals-transfer-error :error-text="errorText" @close="errorText = undefined" />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";

type Providers = "zksync" | "ethereum";

export default Vue.extend({
  name: "TransferProviders",
  props: {
    providers: {
      type: Array as PropType<Providers[]>,
      default: () => [],
      required: false,
    },
  },
  data() {
    return {
      errorText: undefined as string | undefined,
    };
  },
  methods: {
    setError(errorText: string) {
      this.errorText = errorText;
    },
  },
});
</script>
