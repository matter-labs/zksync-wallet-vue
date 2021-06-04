<template>
  <div class="tokenAccount dappPageWrapper">
    <div class="tileBlock _margin-bottom-0">
      <div class="tileHeadline withBtn h3">
        <nuxt-link :to="fromRoute && fromRoute.fullPath !== $route.fullPath && fromRoute.path !== '/withdraw' ? fromRoute : '/account'" class="returnBtn">
          <v-icon name="ri-arrow-left-line" />
        </nuxt-link>
        <span class="tokenSymbol">{{ token.symbol }}</span>
      </div>
      <div v-if="loading">
        <loader class="_display-block _margin-x-auto _margin-y-3" />
      </div>
      <div v-else>
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
        <div class="infoBlock _margin-top-1">
          <div class="headline">Creator address:</div>
        </div>
        <div class="_display-flex _justify-content-space-between balanceWithdraw">
          <div class="infoBlock">
            <div class="balance">
              <nuxt-link v-if="!isOwnAddress" :to="`/contacts?w=${token.creatorAddress}`" class="tokenSymbol address">{{ getAddressName(token.creatorAddress) }}</nuxt-link>
              <div v-else>Own account</div>
            </div>
          </div>
          <i-button class="_padding-y-0" link size="lg" variant="secondary" :to="`/nft/withdraw?token=${nftID}`">- Withdraw</i-button>
        </div>
        <i-button block class="_margin-top-1" size="lg" variant="secondary" :to="`/nft/transfer?token=${nftID}`">
          <v-icon class="planeIcon" name="ri-send-plane-fill" />&nbsp;&nbsp;Transfer
        </i-button>
      </div>
    </div>
    <transactions class="_margin-top-0" :filter="`NFT-${nftID}`" />
  </div>
</template>

<script lang="ts">
import { ZkInNFT } from "@/types/lib";
import utils from "@/plugins/utils";
import Vue from "vue";

export default Vue.extend({
  asyncData({ from }) {
    return {
      fromRoute: from,
    };
  },
  data() {
    return {
      token: <ZkInNFT>{},
      loading: true,
    };
  },
  computed: {
    nftID(): number {
      return parseInt(this.$route.params.symbol);
    },
    isOwnAddress(): boolean {
      if (!this.token) {
        return false;
      }
      return this.token.creatorAddress.toLowerCase() === String(this.$accessor.account.address).toLowerCase();
    },
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData() {
      this.loading = true;
      const balances = this.$accessor.wallet.getNftBalances;
      let found = false;
      for (const item of balances) {
        if (item.id === this.nftID) {
          this.token = item;
          found = true;
          this.loading = false;
          break;
        }
      }
      if (!found) {
        await this.$router.push("/account");
      }
    },
    getAddressName(address: string): string {
      address = address ? String(address).toLowerCase() : "";
      const contactFromStore = this.$accessor.contacts.getByAddress(address);
      return contactFromStore ? contactFromStore.name : address.replace(address.slice(10, address.length - 5), "...");
    },
    copy(value: string) {
      utils.copy(value);
    },
  },
});
</script>
