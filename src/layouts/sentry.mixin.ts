import Vue from "vue";

import { mapGetters } from "vuex";
export default Vue.extend({
  computed: {
    ...mapGetters({
      config: "zk-onboard/config",

      selectedWallet: "zk-onboard/selectedWallet",
      selectedOnboardType: "zk-onboard/selectedOnboardType",

      ethereumState: "zk-onboard/ethereumState",
    }),
  },
  watch: {
    config: {
      handler(value) {
        this.$sentry.setTags({ network: value?.ethereumNetwork?.name });
        this.$sentry.setTags({ zkSyncLibVersion: value?.zkSyncLibVersion });
        this.$sentry.setTags({ zkUIVersion: value?.zkUIVersion });
      },
      deep: true,
      immediate: true,
    },

    selectedWallet: {
      handler(wallet) {
        this.$sentry.setTags({ wallet });
      },
      immediate: true,
    },
    selectedOnboardType: {
      handler(value) {
        this.$sentry.setTags({ "onboard.type": value });
      },
      immediate: true,
    },

    "ethereumState.address": {
      handler(value) {
        if (value) {
          this.$sentry.setUser({ id: value });
        } else {
          this.$sentry.setUser(null);
        }
      },
      immediate: true,
    },
  },
});
