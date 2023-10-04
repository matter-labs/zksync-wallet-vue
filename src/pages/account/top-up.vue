<template>
  <div class="providers-page dappPageWrapper">
    <div class="providers-page-tile tileBlock">
      <h3 class="tileHeadline withBtn">
        <nuxt-link to="/account" class="_icon-wrapped -rounded -sm returnBtn _display-flex">
          <v-icon name="ri-arrow-left-line" scale="1" />
        </nuxt-link>
        Top&nbsp;up
      </h3>
      <section class="tileSubContainer">
        <h4 class="tileSmallHeadline">
          Buy Crypto with Credit Card
          <div class="secondaryText estimatedFee">
            <v-icon name="la-charging-station-solid" />
            <span><b>Fee:</b>&nbsp;~3-5%</span>
          </div>
        </h4>
        <div class="secondaryText small _margin-bottom-05">
          You can buy crypto directly on zkSync lite with your credit card, just go through KYC process of our partners
          and enter your wallet address
        </div>
        <TopUpProviders :providers="['ramp', 'moonpay', 'utorg']" />
      </section>
      <div class="orDivider">
        <div class="line"></div>
        <div class="orText">or</div>
        <div class="line"></div>
      </div>
      <section class="tileSubContainer">
        <h4 class="tileSmallHeadline">
          Exchanges
          <div class="secondaryText estimatedFee">
            <v-icon name="la-charging-station-solid" />
            <span><b>Fee:</b>&nbsp;~0.5%</span>
          </div>
        </h4>
        <div class="secondaryText small _margin-bottom-05">
          zkSync lite is integrated with exchanges, so you can deposit/withdraw funds from your favorite exchanges
          directly inside the zkSync network using the benefits of the low fees
        </div>
        <TopUpProviders :providers="['bybit']" />
      </section>
      <div class="orDivider">
        <div class="line"></div>
        <div class="orText">or</div>
        <div class="line"></div>
      </div>
      <section class="tileSubContainer">
        <h4 class="tileSmallHeadline">
          Bridges
          <div class="secondaryText estimatedFee">
            <v-icon name="la-charging-station-solid" />
            <span><b>Fee:</b>&nbsp;~1-90$</span>
          </div>
        </h4>
        <div class="secondaryText small _margin-bottom-05">
          You can bridge your assets from other networks & exchanges using one of our supported bridges
        </div>
        <TopUpProviders :providers="['zksync', 'layerSwap', 'zigzag']" />
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  mounted() {
    this.$analytics.track("visit_top-up");
  },
});
</script>
