<template>
  <div class="cryptoProviders">
    <top-up-providers-ramp v-if="providers.includes('ramp')" class="providerOption" @providerError="setError" />

    <top-up-providers-moonpay v-if="providers.includes('moonpay')" class="providerOption" @providerError="setError" />

    <top-up-providers-utorg v-if="providers.includes('utorg')" class="providerOption" @providerError="setError" />

    <top-up-providers-okex v-if="providers.includes('okex')" class="providerOption" @providerError="setError" />

    <top-up-providers-bybit v-if="providers.includes('bybit')" class="providerOption" @providerError="setError" />

    <top-up-providers-layer-swap
      v-if="providers.includes('layerSwap')"
      class="providerOption"
      @providerError="setError"
    />

    <top-up-providers-zk-sync
      v-if="providers.includes('zksync')"
      class="providerOption"
      data-cy="deposit_provider_zksync"
    />

    <top-up-providers-zig-zag v-if="providers.includes('zigzag')" class="providerOption" @providerError="setError" />

    <block-modals-deposit-error :error-text="errorText" @close="errorText = undefined" />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";

type Providers = "ramp" | "moonpay" | "zksync" | "layerSwap" | "okex" | "bybit" | "utorg" | "zigzag";

export default Vue.extend({
  name: "TopUpProviders",
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
