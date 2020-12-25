<template>
  <div class="indexPage">
    <i-container>
      <i-row center>
        <logo class="_padding-top-7"/>
      </i-row>
      <i-row center>
        <span class="h1 _font-weight-normal">Trustless, scalable crypto payments</span>
      </i-row>
      <i-row center class="_padding-top-2">
        <div class="tileContainer _padding-x-2 _padding-top-1" @click="customWallet()">
          <div class="tile">
            <img src="@/assets/imgs/wallets/external.png" alt="External">
            <i class="tileIcon fas fa-lock"></i>
          </div>
          <div class="tileName"><i-button variant="secondary" size="lg">Connect your wallet</i-button></div>
        </div>
      </i-row>
    </i-container>
  </div>
</template>

<script>
import logo from "@/blocks/Logo.vue";

export default {
  components: {
    logo,
  },
  layout: "index",
  data() {
    return {
      lockVisible: false,
      contactInfoShown: false,
    };
  },
  methods: {
    burnerWallet: function () {
      this.$router.push("/account");
    },
    customWallet: async function () {
      const onboard = this.$store.getters["wallet/getOnboard"];
      onboard.config({
        darkMode: this.$inkline.config.variant !== "light",
      });

      const walletSelect = await onboard.walletSelect();
      if (walletSelect === false) {
        await this.$store.dispatch("wallet/logout");
        return;
      }

      this.$store.commit("showLoader");
      const refreshWalletTry = await this.$store.dispatch("wallet/walletRefresh", false);
      this.$store.commit("hideLoader");
      console.log("refreshWalletTry", refreshWalletTry);
      if (refreshWalletTry !== true) {
        await this.$store.dispatch("wallet/logout");
      } else {
        await this.$router.push("/account");
      }
    },
  },
};
</script>
