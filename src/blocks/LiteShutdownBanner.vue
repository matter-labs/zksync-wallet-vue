<template>
  <section class="liteShutdownBanner" data-cy="liteShutdownBanner">
    <i-container>
      <div class="liteShutdownBanner__card">
        <div class="liteShutdownBanner__content">
          <div class="liteShutdownBanner__icon" aria-hidden="true">
            <img src="@/assets/imgs/warning.svg" alt="" />
          </div>
          <div class="liteShutdownBanner__text">
            <span class="liteShutdownBanner__line"
              >zkSync Lite shuts down May 4th, 2025. Connect your wallet and withdraw your funds now.</span
            >
          </div>
        </div>
        <div class="liteShutdownBanner__actions">
          <a class="liteShutdownBanner__btn" :href="detailsLink" rel="noopener noreferrer" target="_blank">
            <span>Learn More</span>
            <img class="liteShutdownBanner__btnIcon" src="@/assets/imgs/arrow-up-right.svg" alt="" aria-hidden="true" />
          </a>
        </div>
      </div>
    </i-container>
  </section>
</template>

<script lang="ts">
import Vue from "vue";

const DETAILS_LINK = "https://blog.matter-labs.io/8b8964ba7c59";

export default Vue.extend({
  name: "LiteShutdownBanner",
  computed: {
    detailsLink(): string {
      return DETAILS_LINK;
    },
  },
});
</script>
