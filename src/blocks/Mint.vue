<template>
  <div class="mintTokensContainer">
    <i-modal v-model="onlyTestNetModal" size="md">
      <template slot="header">Matter Labs Trial Token</template>
      <div>
        <p>
          MLTT trial token is currently unavailable on mainnet. You can try it on our <a
            href="https://rinkeby.zksync.io/">Rinkeby testnet</a> for now.
        </p>
      </div>
    </i-modal>
    <i-modal v-model="mainModal" class="prevent-close" size="md">
      <template slot="header">Matter Labs Trial Token</template>
      <p v-if="tip" class="_display-block _text-center">{{ tip }}</p>
      <div v-if="loading===false">
        <div v-if="step==='tweet'">
          <p>
            We grant free $MLTT to the first 500 users. To unlock a free withdrawal please tweet from your account with
            our pre-populated text. Your privacy is preserved as your pre-populated wallet address is hashed so no one
            can link your wallet to your social account. Once our bot detects your post, you will be able to claim your
            MLTT.
          </p>
          <a target="_blank"
             :href="`https://twitter.com/intent/tweet?text=%40zksync%2C%20%40the_matter_labs%E2%80%99s%20zkRollup%20for%20trustless%2C%20scalable%20payments%20is%20now%20live%20on%20Ethereum%20mainnet%21%20%0A%0AGive%20it%20a%20try%3A%20%F0%9F%91%89%F0%9F%91%89%20zksync.io%20%0A%0AClaiming%20my%20trial%20tokens%3A%20${getTicketFromAddress(generateSalt())}`"
             class="tweetBtn _margin-top-1"
             @click="tweetClicked()"><i class="fab fa-twitter"></i> Tweet</a>
        </div>
        <div v-else-if="step==='claim'">
          <vue-recaptcha class="recaptchaContainer" :load-recaptcha-script="true" :sitekey="recaptchaSiteID"
                         :theme="$inkline.config.variant === 'light' ? 'dark' : 'light'" @verify="recaptchaVerified($event)" @expired="recaptchaExpired()"
                         @error="recaptchaError()"/>
        </div>
        <div v-else-if="step==='success'">
          <p class="_display-block _text-center">Tokens successfully claimed!</p>
          <checkmark/>
          <i-button block variant="secondary" size="lg" @click="close()">Ok</i-button>
        </div>
        <div v-else-if="step==='error'">
          There was an error. Please, try again later.
        </div>
      </div>
      <loader v-else class="_display-block _margin-x-auto _margin-y-2" />
    </i-modal>
    <i-button v-if="display" block variant="secondary" size="lg" @click="startMint()">⚡ Get some trial tokens! ⚡
    </i-button>
  </div>
</template>

<script>
import Checkmark from "@/components/Checkmark.vue";
import { ETHER_NETWORK_NAME } from "@/plugins/build";

import { walletData } from "@/plugins/walletData";
import crypto from "crypto";
import VueRecaptcha from "vue-recaptcha";

const FAUCET_TOKEN_API = `https://${process.env.APP_ZKSYNC_API_LINK === "stage-api.zksync.dev" ? "stage" : ETHER_NETWORK_NAME}-faucet.zksync.dev`;

export default {
  components: {
    VueRecaptcha,
    Checkmark,
  },
  props: {
    display: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  data() {
    return {
      onlyTestNetModal: false,
      mainModal: false,
      step: "tweet",
      loading: false,
      tip: "",
    };
  },
  computed: {
    recaptchaSiteID: function () {
      return process.env.RECAPTCHA_SITE_KEY;
    },
  },
  methods: {
    startMint: function () {
      if (ETHER_NETWORK_NAME === "mainnet") {
        this.onlyTestNetModal = true;
      } else {
        if (this.step === "tweet") {
          this.checkForTweet();
        }
        this.mainModal = true;
      }
    },
    getTicketFromAddress: function (salt) {
      const preimage = (String(walletData.get().syncWallet.address()).trim() + String(salt).trim()).toLowerCase();

      const hash = crypto.createHash("sha256");
      hash.update(preimage);

      // 13 hex char numbers fit in a double
      const digest = hash.digest("hex").slice(0, 13);
      return parseInt(digest, 16).toString().padStart(16, "0");
    },
    generateSalt: function () {
      if (localStorage.getItem("twitsalt")) {
        return localStorage.getItem("twitsalt");
      } else {
        const salt = Math.random().toString();
        localStorage.setItem("twitsalt", salt);
        return salt;
      }
    },
    tweetClicked: async function () {
      const syncAddress = walletData.get().syncWallet.address();
      localStorage.setItem(`twittMade${syncAddress}`, "true");
      const response = await this.$axios.$get(`${FAUCET_TOKEN_API}/register_address/${syncAddress}/${this.generateSalt()}`);
      if (response.data === "Success") {
        await this.checkForTweet();
      }
    },
    async checkForTweet() {
      const syncAddress = walletData.get().syncWallet.address();
      if (!localStorage.getItem(`twittMade${syncAddress}`)) {
        return false;
      }
      this.loading = true;
      try {
        const response = await this.$axios.$get(`${FAUCET_TOKEN_API}/is_withdraw_allowed/${syncAddress}`);
        console.log("checkForTweet response", response.data);
        if (!response.data || response.data === "false") {
          this.step = "tweet";
        } else {
          this.step = "claim";
        }
      } catch (error) {
        await this.$store.dispatch("toaster/error", error.message);
        console.log("Get status");
      }
      this.loading = false;
    },

    recaptchaVerified: async function (captchaToken) {
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 400);
      });
      this.loading = true;
      try {
        const askMoneyResponse = await this.$axios.$post(`${FAUCET_TOKEN_API}/ask_money`, {
          address: walletData.get().syncWallet.address(),
          "g-recaptcha-response": captchaToken,
        });
        console.log("askMoneyResponse", askMoneyResponse.data);
        if (askMoneyResponse.data === "Success") {
          this.tip = "Claiming tokens...";
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 7000);
          });
          await this.$store.dispatch("wallet/forceRefreshData");
          this.$emit("received");
          this.tip = "";
          this.step = "success";
        } else {
          this.step = "error";
        }
      } catch (error) {
        this.step = "error";
        console.log("askMoney error", error);
      }
      this.loading = false;
    },
    recaptchaExpired: function () {
      console.log("reCaptcha Expired");
    },
    recaptchaError: function () {
      console.log("reCaptcha Error");
    },
    close: function () {
      this.mainModal = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.mintTokensContainer {
  width: 100%;

  .tweetBtn {
    display: block;
    margin: 0 auto;
    width: 150px;
    height: 60px;
    border: none;
    background: #1da1f2;
    font-size: 20px;
    line-height: 60px;
    font-family: $font-family-primary-base;
    color: $white;
    text-align: center;
    text-decoration: none;
    border-radius: 6px;
    transition: filter $transition1;
    cursor: pointer;

    &:hover {
      filter: brightness(110%);
    }

    i {
      font-size: 24px;
      margin-right: 10px;
      transform: translateY(1px);
    }
  }
}
</style>
