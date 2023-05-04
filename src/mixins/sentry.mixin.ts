import Vue from "vue";

import { mapGetters } from "vuex";

export default Vue.extend({
  computed: {
    ...mapGetters({
      config: "zk-onboard/config",

      selectedWallet: "zk-onboard/selectedWallet",

      accountAddress: "zk-account/address",
    }),
  },
  watch: {
    config: {
      handler(value) {
        if (this.$sentry) {
          this.$sentry.setTags({ network: value?.ethereumNetwork?.name });
          this.$sentry.setTags({ zkSyncLibVersion: value?.zkSyncLibVersion });
          this.$sentry.setTags({ zkUIVersion: value?.zkUIVersion });
        }
      },
      deep: true,
      immediate: true,
    },

    selectedWallet: {
      handler(wallet) {
        if (this.$sentry) {
          this.$sentry.setTags({ wallet });
        }
      },
      immediate: true,
    },

    accountAddress: {
      handler(value) {
        if (this.$sentry) {
          this.$sentry.setUser(value ? { id: value } : null);
        }
      },
      immediate: true,
    },
  },
});
