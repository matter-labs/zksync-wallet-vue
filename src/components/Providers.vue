<template>
  <div class="cryptoProviders">
    <provider-ramp
      v-if="providers.includes('ramp')"
      class="providerOption"
      @providerError="setError"
    />
    
    <provider-banxa
      v-if="providers.includes('banxa')"
      class="providerOption"
      @providerError="setError"
    />

    <provider-moonpay
      v-if="providers.includes('moonpay')"
      class="providerOption"
      @providerError="setError"
    />

    <provider-utorg
      v-if="providers.includes('utorg')"
      class="providerOption"
      @providerError="setError"
    />

    <provider-okex
      v-if="providers.includes('okex')"
      class="providerOption"
      @providerError="setError"
    />

    <provider-bybit
      v-if="providers.includes('bybit')"
      class="providerOption"
      @providerError="setError"
    />

    <provider-layer-swap
      v-if="providers.includes('layerSwap')"
      class="providerOption"
      @providerError="setError"
    />

    <provider-orbiter
      v-if="providers.includes('orbiter')"
      class="providerOption"
      @providerError="setError"
    />
  
    <provider-zk-sync
      v-if="providers.includes('zksync')"
      class="providerOption"
      data-cy="deposit_provider_zksync"
    />

    <provider-zig-zag
      v-if="providers.includes('zigzag')"
      class="providerOption"
      @providerError="setError"
    />

    <block-modals-deposit-error
      :error-text="errorText"
      @close="errorText = undefined"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";

type Providers = "banxa" | "ramp" | "orbiter" | "moonpay" | "zksync" | "layerSwap" | "okex" | "bybit" | "utorg" | "zigzag";

export default Vue.extend({
  name: "Providers",
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

<style lang="scss">
.cryptoProviders {
  margin-top: 1rem;
  display: grid;
  width: 100%;
  height: max-content;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-flow: row;
  grid-auto-rows: 52px;
  grid-gap: 11px;

  .providerOption {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 100%;
    height: 100%;
    border: 1px solid #eeeeee;
    border-radius: 6px;
    box-sizing: border-box;
    transition: $transition1;
    transition-property: border-color, opacity;
    will-change: border-color, opacity;
    &.disabled {
      border-color: transparentize($color: #eeeeee, $amount: 0.7);
      background-color: transparentize($color: #eeeeee, $amount: 0.7);

      & > *:not(.loaderContainer) {
        opacity: 0.5;
      }
    }
    &:not(.disabled):hover {
      border-color: #5d65b9 !important;
      cursor: pointer;
    }
    & > * {
      pointer-events: none;
    }

    label {
      display: block;
      height: 100%;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: 700;
      font-size: 18px;
      margin-bottom: 0;
      color: $black;
      transition: color $transition1;
      will-change: color;

      img {
        margin-right: 7px;
      }
    }
    svg, img {
      max-width: 70%;
      max-height: 70%;
      object-fit: contain;
    }
    svg .letter {
      fill: $black;
      transition: fill $transition1;
      will-change: fill;
    }
    .loaderContainer {
      position: absolute;
      width: 20px;
      height: 20px;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
  }
}

.inkline.-dark {
  .cryptoProviders {
    .providerOption {
      border-color: transparentize($color: $gray, $amount: 0.65);
      &.disabled {
        border-color: transparentize($color: $gray, $amount: 0.85) !important;
        background-color: transparentize($color: $gray, $amount: 0.9) !important;
      }

      svg .letter {
        fill: $white;
      }
      label {
        color: #f8f9fa;
      }
    }
  }
}

@media screen and (max-width: $mobile) {
  .cryptoProviders {
    grid-auto-rows: 40px;
    grid-gap: 15px;
  }

  .orDivider {
    padding: 10px 0 !important;
  }
}
</style>
