<template>
  <div class="indexPage">
    <i-container>
      <i-row center>
        <logo />
      </i-row>
      <i-row center>
        <span class="h1 _font-weight-normal">Trustless, scalable crypto payments</span>
      </i-row>
      <i-row center class="_padding-top-3">
        <div class="connectWallet" @click="customWallet()">
          <img src="@/assets/imgs/wallets/external.png" alt="External">
          <div class="text">Connect your wallet</div>
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
    burnerWallet() {
      this.$router.push("/account");
    },
    async customWallet() {
      const onboard = this.$store.getters["wallet/getOnboard"];
      onboard.config({
        darkMode: this.$inkline.config.variant !== "light",
      });

      const refreshWalletTry = await this.$store.dispatch("wallet/walletRefresh");
      if (refreshWalletTry !== true) {
        await this.$store.dispatch("wallet/logout");
      } else {
        await this.$router.push("/account");
      }
    },
  },
};
</script>
