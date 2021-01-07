<template>
  <div class="transactionPage">
    <account-unlock v-if="mainLoading===false" :choosed-token="choosedToken" @selectToken="openTokenList()"/>
    <div v-if="mainError" class="errorText _text-center _margin-top-1">{{ mainError }}</div>
    <div v-if="mainLoading===true" class="tileBlock">
      <div class="tileHeadline h3">Unlock Token</div>
      <div class="nothingFound _padding-y-2">
        <loader/>
      </div>
    </div>
    <i-modal v-model="tokenListModal" size="md">
      <template slot="header">Balances in L2</template>
      <choose-fee-token v-model="tokenListModal" @input="tokenSelected" @selectToken="tokenListModal = false;"/>
    </i-modal>
  </div>
</template>

<script>
import AccountUnlock from "@/blocks/AccountUnlock";
import ChooseFeeToken from "~/blocks/ChooseFeeToken";
export default {
  components: {
    ChooseFeeToken,
    AccountUnlock,
  },
  asyncData({ from }) {
    return {
      fromRoute: from,
    };
  },
  data() {
    return {
      mainLoading: false,
      choosedToken: undefined,
      tokenListModal: false,
      mainError: false,
    };
  },
  computed: {
    isAccountLocked: function () {
      return this.$store.getters["wallet/isAccountLocked"];
    },
  },
  watch: {
    isAccountLocked: {
      immediate: true,
      handler(val) {
        if (val === false) {
          this.$router.push(this.fromRoute ? this.fromRoute : "/transfer");
        }
      },
    },
  },
  methods: {
    tokenSelected: function (value) {
      this.choosedToken = value;
    },
    openTokenList: async function () {
      this.mainLoading = true;
      try {
        const list = await this.$store.dispatch("wallet/getzkBalances");
        this.tokensList = list.filter((e) => e.restricted === false);
        this.tokenListModal = true;
      } catch (error) {
        await this.$store.dispatch("toaster/error", error.message);
      }
      this.mainLoading = false;
    },
  },
};
</script>
