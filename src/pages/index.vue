<template>
  <div class="indexPage">
    <i-container>
      <h1>Connect your L1 ETH Wallet to start</h1>
      <div data-cy="connectWalet-btn" class="tileContainer _margin-top-1" @click="customWallet()">
        <div class="tile">
          <img src="@/assets/imgs/wallets/external.png" alt="External" />
          <i class="tileIcon ri-lock-line"></i>
        </div>
        <div class="tileName">Connect your wallet</div>
      </div>
      <note class="_margin-top-2">
        <template slot="icon">
          <i class="noteIcon ri-information-line"></i>
        </template>
        <template slot="default">
          <div class="noteText">
            By using zkSync: Checkout Gateway, you agree to accept full responsability. See our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a> for the details.
          </div>
        </template>
      </note>
    </i-container>
  </div>
</template>

<script>
import Note from "@/components/Note.vue";

export default {
  components: {
    Note,
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
