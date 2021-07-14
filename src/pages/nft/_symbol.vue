<template>
  <div class="tokenAccount dappPageWrapper">
    <no-nft-token-found>
      <template slot="header">Token unavailable</template>
    </no-nft-token-found>
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
        <div>
          <div class="infoBlock _margin-top-1">
            <div class="headline">Creator address:</div>
          </div>
          <div class="infoBlock">
            <div class="balance">
              <nuxt-link v-if="!isOwnAddress" :to="`/contacts?w=${token.creatorAddress}`" class="tokenSymbol address">{{ getAddressName(token.creatorAddress) }}</nuxt-link>
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
              <div>{{ token.status }}</div>
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
    </div>
    <transactions class="_margin-top-0" :filter="`NFT-${nftID}`" />
  </div>
</template>

<script lang="ts">
import NoNftTokenFound from "@/blocks/modals/NoNftTokenFound.vue";
import utils from "@/plugins/utils";
import { ZkInNFT } from "@/types/lib";
import Vue from "vue";

export default Vue.extend({
  components: {
    NoNftTokenFound,
  },
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
    async getData(): Promise<void> {
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
    copy(value: string): void {
      utils.copy(value);
    },
    withdraw(): void {
      if (this.token.status === "Verified") {
        this.$router.push(`/nft/withdraw?token=${this.nftID}`);
      } else {
        this.$accessor.openModal("NoNftTokenFound");
      }
    },
    transfer(): void {
      if (this.token.status === "Verified") {
        this.$router.push(`/nft/transfer?token=${this.nftID}`);
      } else {
        this.$accessor.openModal("NoNftTokenFound");
      }
    },
  },
});
</script>
