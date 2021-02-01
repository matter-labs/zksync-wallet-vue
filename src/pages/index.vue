<template>
  <div class="indexPage">
    <i-container class="indexFullScreen">
      <i-row center>
        <logo class="logo" />
      </i-row>
      <i-row center>
        <span class="h1 _font-weight-normal">Scalability without compromises</span>
      </i-row>
      <i-row center>
        <p class="secondaryText aboutZkSync">
          zkSync is a trustless, secure, user-centric protocol for scaling payments and smart contracts on Ethereum
        </p>
      </i-row>
      <i-row center class="_padding-top-1 _padding-bottom-2">
        <div class="tileContainer _padding-x-2" @click="customWallet()">
          <div class="tile">
            <img src="@/assets/imgs/wallets/external.png" alt="External">
            <i class="tileIcon fas fa-lock"></i>
          </div>
          <div class="tileName">Connect your wallet</div>
        </div>
      </i-row>
      <div class="scrollDown" @click="scrollDown()">
        <i class="fal fa-mouse-alt"></i>
        <span>Scroll down</span>
      </div>
    </i-container>

    <i-container ref="scrollToBlock">
      <i-row center>
        <span class="h2 _font-weight-normal">Who is behind zkSync</span>
      </i-row>
    </i-container>
    <investors />

    <i-container class="_padding-y-4">
      <i-row center class="_padding-bottom-2">
        <span class="h2 _font-weight-normal">zkSync Features</span>
      </i-row>
      <i-row center around class="featuresContainer">
        <i-column xs="12" md="4" class="featureItem">
          <img src="@/assets/imgs/pages/index/f3.svg" alt="Secure like mainnet">
          <div class="featureHeadline">Secure like mainnet</div>
          <p class="featureText secondaryText">
            Powered by zkRollup with universal setup — the apex L2 scaling solution.
          </p>
        </i-column>
        <i-column xs="12" md="4" class="featureItem">
          <img src="@/assets/imgs/pages/index/f2.svg" alt="Ready for mass adoption">
          <div class="featureHeadline">Ready for mass adoption</div>
          <p class="featureText secondaryText">
            Enables Paypal-scale throughput for your dapp or wallet today.
          </p>
        </i-column>
        <i-column xs="12" md="4" class="featureItem">
          <img src="@/assets/imgs/pages/index/f1.svg" alt="User experience first">
          <div class="featureHeadline">User experience first</div>
          <p class="featureText secondaryText">
            A protocol designed with obsession over user and developer experience.
          </p>
        </i-column>
      </i-row>
    </i-container>
  </div>
</template>

<script>
import logo from "@/blocks/Logo.vue";
import investors from "@/blocks/Investors.vue";

export default {
  components: {
    logo,
    investors
  },
  layout: "index",
  data() {
    return {
      lockVisible: false,
      contactInfoShown: false,
    };
  },
  methods: {
    scrollDown: function() {
      this.$scrollTo(
        this.$refs.scrollToBlock.$el,
        500,
        {
          x:false,
          y:true,
          cancelable: true,
          offset: -10,
        }
      );
    },
    customWallet: async function () {
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
