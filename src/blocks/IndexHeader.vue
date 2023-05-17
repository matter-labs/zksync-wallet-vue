<template>
  <i-layout-header class="indexHeader" :class="{ opened: opened }">
    <div class="mobileIndexHeader">
      <i-container class="mobileOnly">
        <i-row class="_display-flex _justify-content-between _flex-nowrap">
          <i-column>
            <transition name="fade">
              <block-logo />
            </transition>
          </i-column>
          <i-column class="_padding-right-0">
            <div class="hamContainer">
              <svg id="ham" viewBox="0 0 100 100" width="80" @click="opened = !opened">
                <path
                  class="line top"
                  d="m 30,33 h 40 c 0,0 9.044436,-0.654587 9.044436,-8.508902 0,-7.854315 -8.024349,-11.958003 -14.89975,-10.85914 -6.875401,1.098863 -13.637059,4.171617 -13.637059,16.368042 v 40"
                />
                <path class="line middle" d="m 30,50 h 40" />
                <path
                  class="line bottom"
                  d="m 30,67 h 40 c 12.796276,0 15.357889,-11.717785 15.357889,-26.851538 0,-15.133752 -4.786586,-27.274118 -16.667516,-27.274118 -11.88093,0 -18.499247,6.994427 -18.435284,17.125656 l 0.252538,40"
                />
              </svg>
            </div>
          </i-column>
        </i-row>
      </i-container>
    </div>
    <div class="mainIndexHeader">
      <i-container>
        <i-row>
          <i-column :xs="12" :md="4" class="_padding-left-0 desktopOnly">
            <block-logo />
          </i-column>
          <i-column :xs="12" :md="4" class="_margin-left-auto _padding-right-0 _justify-content-end desktopOnly">
            <block-social-block />
          </i-column>
        </i-row>
      </i-container>
    </div>
  </i-layout-header>
</template>

<script lang="ts">
import Vue from "vue";
import { ZkConfig } from "@rsksmart/rif-rollup-nuxt-core/types";

interface DropdownOption {
  name: string;
  link: string;
  isDividerAfter?: true;
}

export default Vue.extend({
  data() {
    return {
      firstHovered: false,
      opened: false,
      dropdownOpened: false,
    };
  },
  computed: {
    dropdownOptions(): DropdownOption[] {
      return [
        {
          name: "Explore zkSync",
          link: "https://ecosystem.zksync.io",
          isDividerAfter: true,
        },

        {
          name: "zkSync Era Portal",
          link: "https://portal.zksync.io",
        },
        {
          name: "zkSync Era Docs",
          link: "https://era.zksync.io/docs/",
        },
        {
          name: "Block Explorer",
          link: this.config.zkSyncNetwork.explorer,
        },
        {
          name: "zkCheckout",
          link: this.checkoutLink,
        },
      ];
    },
    config(): ZkConfig {
      return this.$store.getters["zk-onboard/config"];
    },
    checkoutLink(): string {
      const postfix =
        this.config.zkSyncNetwork.ethereumNetwork === "mainnet" ? "" : `-${this.config.zkSyncNetwork.ethereumNetwork}`;
      return `https://checkout${postfix}.zksync.io`;
    },
  },
});
</script>
