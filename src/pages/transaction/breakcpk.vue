<template>
  <div class="transactionPage cpkPage dappPageWrapper">
    <div v-if="!success" class="transactionBlock">
      <div class="transactionTile tileBlock">
        <div class="tileHeadline withBtn h3">
          <nuxt-link class="_icon-wrapped -rounded -sm returnBtn _display-flex" :to="routeBack">
            <v-icon name="ri-arrow-left-line" scale="1" />
          </nuxt-link>
          <div>Testing Feature | Break CPK</div>
        </div>

        <div class="_padding-top-1 inputLabel">Private key</div>
        <i-input
          ref="input"
          v-model="privateKey"
          autocomplete="none"
          class="walletAddress"
          maxlength="100"
          data-cy="address_block_wallet_address_input"
          placeholder="Private key used to create provider"
          spellcheck="false"
          type="text"
        />

        <div class="_padding-top-1 inputLabel">Wrong network</div>
        <i-input
          ref="input"
          v-model="wrongNetwork"
          autocomplete="none"
          class="walletAddress"
          maxlength="100"
          data-cy="address_block_wallet_address_input"
          placeholder="Wrong network name"
          spellcheck="false"
          type="text"
        />

        <div v-if="error" class="errorText _text-center _margin-top-1" data-cy="transaction_error_text">{{ error }}</div>

        <!-- Commit button -->
        <i-button
          :disabled="buttonLoader || (hasSigner && !privateKey)"
          block
          class="_margin-top-1 _display-flex flex-row"
          data-cy="commit_transaction_button"
          size="lg"
          variant="secondary"
          @click="breakCPK()"
        >
          <div class="_display-flex _justify-content-center _align-items-center">
            <v-icon v-if="!hasSigner" name="md-vpnkey-round" />&nbsp;&nbsp;
            <div>{{ hasSigner ? "" : "Authorize to " }} Break cpk</div>
            <loader v-if="buttonLoader" class="_margin-left-1" size="xs" />
          </div>
        </i-button>
      </div>
    </div>
    <div v-else class="successBlock tileBlock">
      <div class="tileHeadline h3">
        <span>Testing Feature | Break CPK</span>
      </div>
      <checkmark />
      <i-button data-cy="success_block_ok_button" block size="lg" variant="secondary" class="_margin-top-2" @click="success = false">Ok</i-button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropOptions } from "vue";
import { Route } from "vue-router/types";
import { ethers } from "ethers";
import { getDefaultProvider, Wallet } from "zksync";

export default Vue.extend({
  props: {
    fromRoute: {
      required: false,
      type: Object,
      default: () => {},
    } as PropOptions<Route>,
  },
  data() {
    return {
      buttonLoader: false,
      success: false,
      privateKey: "",
      wrongNetwork: "mainnet",
      error: "",
    };
  },
  computed: {
    routeBack(): Route | string {
      if (this.fromRoute && this.fromRoute.fullPath !== this.$route.fullPath) {
        return this.fromRoute;
      }
      return "/account";
    },
    hasSigner(): boolean {
      return this.$store.getters["zk-wallet/hasSigner"];
    },
  },
  methods: {
    async breakCPK() {
      if (!this.hasSigner) {
        this.buttonLoader = true;
        try {
          await this.$store.dispatch("zk-wallet/requestSigner");
        } catch (error) {
          console.warn("Get signer error\n", error);
          this.error = (error as Error).toString();
        }
        this.buttonLoader = false;
      } else {
        if (!this.privateKey) {
          return;
        }
        this.buttonLoader = true;
        try {
          const ethersProvider = ethers.getDefaultProvider(this.wrongNetwork);
          const syncProvider = await getDefaultProvider(this.$store.getters["zk-provider/network"]);
          const sender = new ethers.Wallet(this.privateKey).connect(ethersProvider);
          const syncWallet = await Wallet.fromEthSigner(sender, syncProvider);
          const changePubkey = await syncWallet.setSigningKey({
            feeToken: "ETH",
            ethAuthType: "ECDSALegacyMessage",
          });
          console.log("changePubkey", changePubkey);
          await changePubkey.awaitReceipt();
          this.success = true;
          console.log("CPK Done");
        } catch (error) {
          console.warn("Break CPK error\n", error);
          this.error = (error as Error).toString();
        }
        this.buttonLoader = false;
      }
    },
  },
});
</script>
