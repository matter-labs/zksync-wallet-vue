import Vue from "vue";

import { mapGetters } from "vuex";
export default Vue.extend({
  computed: {
    ...mapGetters({
      network: "zk-provider/network",
      selectedWallet: "zk-onboard/selectedWallet",
    }),
  },
  watch: {
    network: {
      handler(network: string): void {
        this.$analytics.set({ network });
      },
      immediate: true,
    },

    selectedWallet: {
      handler(wallet: string): void {
        this.$analytics.set({ wallet });
      },
      immediate: true,
    },
  },
});
