<template>
  <i-layout class="indexLayout">
    <block-logging-in-loader />
    <block-index-header />
    <block-modals-wrong-network />
    <block-modals-requesting-provider-error />
    <block-modals-onboard-error />
    <block-announcement />
    <i-layout-content class="routerContainer">
      <transition name="fade" mode="out-in">
        <nuxt />
      </transition>
    </i-layout-content>
    <block-footer />
  </i-layout>
</template>

<script lang="ts">
import Vue from "vue";
import theme from "@matterlabs/zksync-nuxt-core/utils/theme";
import SentryMixin from "@/mixins/sentry.mixin";
import AnalyticsMixin from "@/mixins/analytics.mixin";

export default Vue.extend({
  mixins: [SentryMixin, AnalyticsMixin],
  watch: {
    "$inkline.config.variant": {
      immediate: true,
      handler(newTheme) {
        this.$store.commit("zk-onboard/setOnboardTheme", newTheme);
      },
    },
  },
  mounted() {
    this.$inkline.config.variant = theme.getUserTheme();
  },
});
</script>

<style lang="scss">
.indexLayout {
  min-height: 100vh;

  .routerContainer {
    .dappPageWrapper {
      & > * {
        margin: 1rem 0;
      }
    }
  }

  footer a {
    color: $purple;
    transition: color $transition2;

    &:hover {
      color: $lightViolet;
    }
  }

  @media (max-width: $mobile) {
    //min-height: $minRouteHeightWithExtra;

    .routerContainer {
      min-height: auto;
    }
  }

  .projectLogo {
    width: 100%;
    max-width: 300px;
    height: auto;
  }

  .externalWalletPopover .popover {
    width: 330px;
    padding: 20px 30px;

    &.-dark {
      .iconsBlock a {
        i,
        .ov-icon {
          color: $darkViolet;
        }
      }
    }

    &.-light {
      .iconsBlock a {
        i,
        .ov-icon {
          color: $white;
        }
      }
    }

    .h5 {
      margin: 0;
      font-size: 22px;
      text-align: center;
    }

    .description {
      margin-bottom: 15px;
      font-size: 16px;
      line-height: 20px;
    }

    .contactInfo {
      width: 100%;
      max-width: 255px;
      margin: 15px auto 0;

      .infoDescription {
        font-size: 12px;
        line-height: 15px;
        text-align: center;
      }

      .iconsBlock {
        display: flex;
        justify-content: space-between;
        margin-top: 15px;
        padding: 0 18px;

        a {
          display: block;
          width: 48px;
          height: 48px;
          overflow: hidden;
          background-color: $violet;
          border-radius: 50%;

          i,
          .ov-icon {
            display: block;
            width: 100%;
            height: 100%;
            font-size: 20px;
            line-height: 48px;
            text-align: center;
          }
        }
      }
    }
  }
}
</style>
