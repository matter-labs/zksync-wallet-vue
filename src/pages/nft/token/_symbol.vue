<template>
  <div class="tokenAccount dappPageWrapper">
    <i-modal v-model="tokenUnavailableModal" size="md">
      <template #header>Token unavailable</template>
      <p>Minted tokens are available for transactions only after the Mint transaction gets verified.</p>
    </i-modal>
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
        <div v-if="nftData && nftData.exists" class="twoColumnBlock _margin-top-1">
          <div v-if="nftData.image" class="infoBlock">
            <img-with-loader loader-size="sm" :src="nftData.image" :alt="`NFT-${tokenID}`" class="nftImage" />
          </div>
          <div>
            <div v-if="nftData.name" class="infoBlock">
              <div class="headline">Name:</div>
              <div class="infoBlock">
                <div class="balance">{{ nftData.name }}</div>
              </div>
            </div>
            <div v-if="nftData.description" class="infoBlock" :class="{ '_margin-top-1': nftData.name }">
              <div class="headline">Description:</div>
              <div class="infoBlock">
                <div class="balance">{{ nftData.description }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="twoColumnBlock _margin-top-1">
          <div class="infoBlock">
            <div class="headline">Creator:</div>
            <div class="balance">
              <nuxt-link v-if="!isOwnAddress" :to="`/contacts/${token.creatorAddress}`" class="tokenSymbol address"
                >{{ getAddressName(token.creatorAddress) }}
              </nuxt-link>
              <div v-else>Own account</div>
            </div>
          </div>
          <div class="infoBlock">
            <div class="headline">Status:</div>
            <div v-if="!loadingToken" class="balance">
              <div>{{ nftTokenInfo ? "Verified" : "Not verified" }}</div>
            </div>
            <div v-else class="secondaryText">Loading...</div>
          </div>
        </div>
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
                  <template #body>Copied!</template>
                </i-tooltip>
              </div>
            </div>
          </div>
        </div>
        <div v-if="tokenCID" class="infoBlock _margin-top-1">
          <div class="headline">Content ID:</div>
          <div class="infoBlock">
            <div class="balance">
              <div class="copyGrid">
                <span class="tokenSymbol hash">{{ tokenCID }}</span>
                <i-tooltip placement="right" trigger="click" class="copyIcon" @click.native="copy(tokenCID)">
                  <div class="iconContainer">
                    <v-icon name="ri-clipboard-line" />
                  </div>
                  <template #body>Copied!</template>
                </i-tooltip>
              </div>
            </div>
          </div>
        </div>
        <div v-if="tokenCID">
          <div class="infoBlock _margin-top-1">
            <div class="headline">NFT Metadata:</div>
          </div>
          <div class="infoBlock">
            <div v-if="!nftDataLoading" class="balance">
              <a v-if="nftData && nftData.exists" target="_blank" :href="`${ipfsGateway}/ipfs/${tokenCID}`">
                <span>Link to metadata</span>
                <v-icon name="ri-external-link-line" />
              </a>
              <div v-else class="errorText">Metadata not found</div>
            </div>
            <div v-else class="secondaryText">Loading...</div>
          </div>
        </div>
        <i-button-group size="lg" class="_width-100 _margin-top-1 _display-flex nftButtonGroup">
          <i-button
            :disabled="loadingToken"
            :class="{ '-disabled': !actionsAllowed }"
            class="_flex-fill _margin-0"
            size="lg"
            block
            variant="secondary"
            @click="withdraw()"
          >
            <div class="_display-flex _justify-content-center _align-items-center">
              <v-icon class="planeIcon" name="ri-hand-coin-fill" />&nbsp;&nbsp;Withdraw
              <loader v-if="loadingToken" class="_margin-left-1" size="xs" />
            </div>
          </i-button>
          <i-button
            :disabled="loadingToken"
            :class="{ '-disabled': !actionsAllowed }"
            class="_flex-fill _margin-0"
            block
            size="lg"
            variant="secondary"
            @click="transfer()"
          >
            <div class="_display-flex _justify-content-center _align-items-center">
              <v-icon class="planeIcon" name="ri-send-plane-fill" />&nbsp;&nbsp;Transfer
              <loader v-if="loadingToken" class="_margin-left-1" size="xs" />
            </div>
          </i-button>
        </i-button-group>
      </div>
      <div v-else class="tokenNotFound">Token wasn't found in your balances</div>
    </div>
    <transactions class="_margin-top-0" :token="tokenID" :token-exists="!!nftTokenInfo" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Route } from "vue-router/types";
import { NFT, NFTInfo } from "zksync/build/types";
import { copyToClipboard } from "@matterlabs/zksync-nuxt-core/utils";
import { ModuleOptions, ZkContact } from "@matterlabs/zksync-nuxt-core/types";
import { getAddress } from "ethers/lib/utils";
import { NFTItem } from "@/store/nfts";
import { getCIDFromContentHash } from "@/utils/nft";
import computeReturnLink from "@/utils/computeReturnLink";

let updateTokenStatusInterval: ReturnType<typeof setInterval>;
export default Vue.extend({
  asyncData({ redirect, params }) {
    if (!params.symbol) {
      return redirect("/account");
    }
  },
  data() {
    return {
      loadingToken: false,
      tokenUnavailableModal: false,
      nftTokenInfo: undefined as undefined | NFTInfo,
    };
  },
  computed: {
    returnLink(): string | Route {
      return computeReturnLink(this, "/account/nft");
    },
    ipfsGateway(): string {
      return (this.$store.getters["zk-onboard/options"] as ModuleOptions).ipfsGateway!;
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
    actionsAllowed(): boolean {
      return Boolean(!this.loadingToken && this.nftTokenInfo);
    },
    isOwnAddress(): boolean {
      return getAddress(this.$store.getters["zk-account/address"]) === getAddress(this.token.creatorAddress);
    },
    nftDataLoading(): boolean {
      if (!this.tokenCID) {
        return false;
      }
      return this.$store.getters["nfts/getNFTLoading"](this.tokenCID);
    },
    nftData(): NFTItem | undefined {
      if (!this.tokenCID) {
        return undefined;
      }
      return this.$store.getters["nfts/getNFT"](this.tokenCID);
    },
    tokenCID(): string | undefined {
      if (!this.token) {
        return undefined;
      }
      return getCIDFromContentHash(this.token.contentHash);
    },
  },
  watch: {
    tokenCID: {
      immediate: true,
      handler(val) {
        if (val) {
          this.$store.dispatch("nfts/requestNFT", { cid: val });
        }
      },
    },
  },
  mounted() {
    this.requestNFTTokenInfo();
    this.updateTokenStatus();
    if (this.tokenCID) {
      this.$store.dispatch("nfts/requestNFT", { cid: this.tokenCID });
    }
  },
  beforeDestroy() {
    clearInterval(updateTokenStatusInterval);
  },
  methods: {
    getAddressName(address: string): string {
      const contactFromStore: ZkContact = this.$store.getters["zk-contacts/contactByAddress"](address);
      return contactFromStore && !contactFromStore.deleted
        ? contactFromStore.name
        : address.replace(address.slice(6, address.length - 3), "...");
    },
    copy(value: string): void {
      copyToClipboard(value);
    },
    async requestNFTTokenInfo() {
      this.loadingToken = true;
      try {
        this.nftTokenInfo = await this.$store.dispatch("zk-tokens/getNFT", this.tokenID);
        if (this.nftTokenInfo) {
          clearInterval(updateTokenStatusInterval);
        }
      } catch (error) {
        if (error && (error as Error).message && !(error as Error).message.includes("operation is not verified yet")) {
          console.warn(`Error loading NFT token with ID ${this.tokenID}`, error);
        }
        this.nftTokenInfo = undefined;
      }
      this.loadingToken = false;
    },
    withdraw() {
      if (!this.actionsAllowed) {
        return (this.tokenUnavailableModal = true);
      }
      this.$router.push(`/transaction/nft/withdraw?token=${this.tokenID}`);
    },
    transfer() {
      if (!this.actionsAllowed) {
        return (this.tokenUnavailableModal = true);
      }
      this.$router.push(`/transaction/nft/transfer?token=${this.tokenID}`);
    },
    updateTokenStatus() {
      clearInterval(updateTokenStatusInterval);
      updateTokenStatusInterval = setInterval(async () => {
        if (!this.nftTokenInfo) {
          await this.requestNFTTokenInfo();
        }
      }, 30000);
    },
  },
});
</script>

<style lang="scss">
.twoColumnBlock {
  width: 100%;
  height: max-content;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: 100%;
  grid-gap: 20px;
}
.nftImage {
  width: 100%;
  max-height: 250px;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    border-radius: 4px;
  }
}
</style>
