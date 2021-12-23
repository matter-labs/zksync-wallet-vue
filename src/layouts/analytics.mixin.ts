import Vue from "vue";

import { mapGetters } from "vuex";
export default Vue.extend({
  computed: {
    ...mapGetters({
      network: "zk-provider/network",
    }),
  },
  watch: {
    network: {
      handler(network: string): void {
        this.$analytics.set({ network });
      },
      immediate: true,
    },
  },
});
