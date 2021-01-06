<template>
  <div class="transactionPage">
    <account-unlock v-if="true" :choosed-token="choosedToken" @selectToken="openTokenList()"/>
    <div v-if="mainError" class="errorText _text-center _margin-top-1">{{ mainError }}</div>
    <div v-if="mainLoading===true" class="tileBlock">
      <div class="tileHeadline h3">Unlock Token</div>
      <div v-if="mainLoading===true" class="nothingFound _padding-y-2">
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
  data() {
    return {
      mainLoading: true,
      choosedToken: undefined,
      tokenListModal: false,
      mainError: false,
    };
  },
  mounted() {
    if (!this.$store.getters["wallet/isAccountLocked"]) {
      this.redirect("/account");
    }
    this.mainLoading = false;
  },
  methods: {
    tokenSelected: function (value) {
      console.log(value);
      this.choosedToken = value;
    },
    openTokenList: async function () {
      this.mainLoading = true;
      try {
        const list = await this.$store.dispatch("wallet/getzkBalances");
        this.tokensList = list.map((e) => ({ ...e, balance: e.balance }));
        this.tokenListModal = true;
      } catch (error) {
        await this.$store.dispatch("toaster/error", error.message);
      }
      this.mainLoading = false;
    },
  },
};
</script>
