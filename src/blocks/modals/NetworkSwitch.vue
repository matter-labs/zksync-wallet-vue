<template>
  <i-modal v-model="opened" size="md" class="network-switch">
    <template slot="header">Network Configuration</template>
    <ul class="network-list">
      <li v-for="option in options" :key="option.name" class="network-list-item" @click="changeNetworkConfig(option)">
        <span>
          <v-icon v-if="option.name === selected" class="selected" name="ri-check-line" />
        </span>
        <span>{{ option.title }} </span>
      </li>
    </ul>
  </i-modal>
</template>

<script lang="ts">
import { NetworkConfigOption } from "@/plugins/config";
import Vue from "vue";

export default Vue.extend({
  name: "NetworkSwitch",
  computed: {
    options() {
      return this.$accessor.config.options.filter((item) => item.name !== "mainnet");
    },
    selected() {
      return this.$accessor.config.network.name;
    },
    opened: {
      set(val): void {
        if (val === false) {
          this.$accessor.closeActiveModal();
        }
      },
      get(): boolean {
        return this.$accessor.currentModal !== null && this.$accessor.currentModal === "NetworkSwitch";
      },
    },
  },
  methods: {
    changeNetworkConfig(option: NetworkConfigOption) {
      this.$accessor.config.changeNetworkConfig(option);
    },
  },
});
</script>

<style lang="scss">
.network-list {
  width: 100%;
  overflow-x: hidden;
  height: 100%;
  overflow-y: auto !important;
  background-color: $bgSecondary;
  border-radius: $borderRadius;
  box-shadow: $shadowInset;
  list-style: none;
  margin: 0;
  padding: 0;
}

.network-list-item {
  display: grid;
  grid-gap: 0.4rem;
  grid-template-columns: 25px minmax(0, 1fr);
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  height: 60px;
  padding: 0 20px;
  text-decoration: none;
  border-bottom: 1px solid;
  cursor: pointer;
  transition: $transition1;
  transition-property: background-color, color;
  margin: 0;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: transparentize($color: $gray, $amount: 0.9);
  }

  .selected {
    color: $green;
  }
}
</style>

<style lang="scss">
body.inkline {
  &.-light {
    .network-switch .network-list {
      .network-list-item {
        color: $black;
        border-color: $input-border-color-light;
      }
    }
  }

  &.-dark {
    .network-switch .network-list {
      .network-list-item {
        color: $white;
        border-color: $input-border-color-dark;
      }
    }
  }
}
</style>
