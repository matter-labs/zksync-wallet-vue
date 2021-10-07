<template>
  <div class="tokenAccount dappPageWrapper">
    <div class="tileBlock _margin-bottom-0">
      <div class="tileHeadline withBtn h3">
        <nuxt-link :to="returnLink" class="returnBtn">
          <v-icon name="ri-arrow-left-line" />
        </nuxt-link>
        <div class="_display-flex _align-items-center _justify-content-center">
          <span class="tokenSymbol">NFT-{{ tokenID }}</span>
        </div>
      </div>
      <div v-if="!tokenNotFound && !token" class="tokenNotFound">
        <div class="secondaryText">Loading...</div>
      </div>
      <div v-else-if="!tokenNotFound">
        <div class="infoBlock _margin-top-1">
          <div class="headline">Content hash:</div>
          <div class="infoBlock">
            <div class="balance">
              <div class="copyGrid">
                <span class="tokenSymbol hash">{{ token.contentHash }}</span>
                <i-tooltip placement="right" trigger="click" class="copyIcon" @click.native="copy(token.contentHash)">
                  <div class="iconContainer">
                    <v-icon name="ri-clipboard-line" />
                  </div>
                  <template slot="body">Copied!</template>
                </i-tooltip>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div class="infoBlock _margin-top-1">
            <div class="headline">Creator:</div>
          </div>
          <div class="infoBlock">
            <div class="balance">
              <nuxt-link v-if="!isOwnAddress" :to="`/contacts/${token.creatorAddress}`" class="tokenSymbol address">{{ getAddressName(token.creatorAddress) }}</nuxt-link>
              <div v-else>Own account</div>
            </div>
          </div>
        </div>
        <div>
          <div class="infoBlock _margin-top-1">
            <div class="headline">Status:</div>
          </div>
          <div class="infoBlock">
            <div class="balance">
              <div>{{ token.verified ? "Verified" : "Not verified" }}</div>
            </div>
          </div>
        </div>
        <i-button-group size="lg" class="_width-100 _margin-top-1 _display-flex nftButtonGroup">
          <i-button class="_flex-fill _margin-0" size="lg" block variant="secondary" @click="withdraw()"
            ><v-icon class="planeIcon" name="ri-hand-coin-fill" />&nbsp;&nbsp;Withdraw</i-button
          >
          <i-button class="_flex-fill _margin-0" block size="lg" variant="secondary" @click="transfer()"
            ><v-icon class="planeIcon" name="ri-send-plane-fill" />&nbsp;&nbsp;Transfer</i-button
          >
        </i-button-group>
      </div>
      <div v-else class="tokenNotFound">Token not found</div>
    </div>
    <!-- <transactions class="_margin-top-0" :filter="symbol" /> -->
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Route } from "vue-router/types";
import { NFT } from "zksync/build/types";
import { copyToClipboard } from "matter-dapp-module/utils";
import { ZkContact } from "matter-dapp-module/types";
import { getAddress } from "ethers/lib/utils";

export default Vue.extend({
  asyncData({ from, redirect, params }) {
    if (!params.symbol) {
      return redirect("/account");
    }
    return {
      fromRoute: from,
    };
  },
  data() {
    return {
      fromRoute: <undefined | Route>undefined,
      loadingToken: false,
      loadingBalance: false,
    };
  },
  computed: {
    returnLink(): string | Route {
      return this.fromRoute && this.fromRoute.fullPath !== this.$route.fullPath && this.fromRoute.path !== "/withdraw" ? this.fromRoute : "/account";
    },
    tokenID(): number {
      return parseInt(this.$route.params.symbol);
    },
    token(): NFT {
      return this.$store.getters["zk-balances/nfts"][this.tokenID];
    },
    tokenNotFound(): boolean {
      return !this.accountStateLoading && !this.token;
    },
    accountStateLoading(): boolean {
      return this.$store.getters["zk-account/accountStateLoading"];
    },
    isOwnAddress(): boolean {
      return getAddress(this.$store.getters["zk-account/address"]) === getAddress(this.token.creatorAddress);
    },
  },
  methods: {
    getAddressName(address: string): string {
      const contactFromStore: ZkContact = this.$store.getters["zk-contacts/contactByAddress"](address);
      return contactFromStore && !contactFromStore.deleted ? contactFromStore.name : address.replace(address.slice(6, address.length - 3), "...");
    },
    copy(value: string): void {
      copyToClipboard(value);
    },
    withdraw(): void {
      this.$router.push(`/transaction/nft/withdraw?token=${this.tokenID}`);
    },
    transfer(): void {
      this.$router.push(`/transaction/nft/transfer?token=${this.tokenID}`);
    },
  },
});
</script>
