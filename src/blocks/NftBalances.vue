<template>
  <div class="balancesBlock tileBlock">
    <div class="tileHeadline h3">
      <span>NFT Tokens</span>
    </div>
    <slot />
    <div
      v-if="!isSearching && !hasDisplayedBalances && (accountStateLoading === false || accountStateRequested)"
      class="centerBlock"
    >
      <p class="tileText">No NFT tokens yet. You can either mint or request them from someone!</p>
      <i-button
        data-cy="account_deposit_button"
        block
        link
        size="lg"
        variant="secondary"
        class="_margin-top-1"
        to="/transaction/nft/mint"
        >+ Mint NFT
      </i-button>
    </div>
    <div v-else class="balances">
      <div v-if="!accountStateLoading || accountStateRequested">
        <div class="_display-flex _justify-content-space-between">
          <i-button
            data-cy="account_deposit_button"
            class="_padding-y-0"
            link
            size="lg"
            variant="secondary"
            to="/transaction/nft/mint"
            >+ Mint NFT
          </i-button>
          <i-button
            data-cy="account_withdraw_button"
            class="_padding-y-0"
            link
            size="lg"
            variant="secondary"
            to="/transaction/nft/withdraw"
          >
            - Withdraw NFT <span class="desktopOnly">&nbsp;to L1</span>
          </i-button>
        </div>
        <i-button
          data-cy="account_transfer_button"
          block
          class="_margin-y-1"
          size="lg"
          variant="secondary"
          to="/transaction/nft/transfer"
        >
          <v-icon class="planeIcon" name="ri-send-plane-fill" />&nbsp;&nbsp;Transfer NFT
        </i-button>
        <i-input ref="searchInput" v-model="search" placeholder="Filter tokens" maxlength="6" autofocus>
          <template #prefix>
            <v-icon name="ri-search-line" />
          </template>
        </i-input>
      </div>

      <div v-if="accountStateLoading && !accountStateRequested" class="centerBlock">
        <loader />
      </div>
      <div v-else-if="isSearching && !hasDisplayedBalances" class="centerBlock">
        <span>
          Your search <strong>"{{ search }}"</strong> did not match any NFT tokens
        </span>
      </div>
      <div v-else class="contactsListContainer genericListContainer">
        <div
          v-for="(item, tokenID) in displayedList"
          :key="tokenID"
          class="contactItem nftItem"
          @click.self="$router.push(`/nft/token/${tokenID}`)"
        >
          <nuxt-link class="nftImageSide" :to="`/nft/token/${tokenID}`">
            <img-with-loader
              v-if="getImageFromNFT(item.contentHash)"
              :src="getImageFromNFT(item.contentHash)"
              :alt="`NFT-${tokenID}`"
              class="userImg"
            />
            <div v-else class="userImg">
              <v-icon class="_margin-x-auto" name="ri-file-line" />
            </div>
            <i-tooltip class="nftStatus" placement="left">
              <v-icon v-if="item.verified" class="nftStatusIcon verified" name="ri-check-double-line" />
              <v-icon v-else class="nftStatusIcon committed" name="ri-check-line" />
              <template #body>{{ item.verified ? "Verified" : "Committed" }}</template>
            </i-tooltip>
          </nuxt-link>
          <div class="contactInfo _pointer-events-none">
            <div class="contactName">{{ item.symbol }}</div>
            <div class="contactAddress walletAddress">{{ item.contentHash }}</div>
          </div>
          <div class="iconsBlock _pointer-events-none">
            <i-tooltip placement="left" trigger="click">
              <i-button
                class="copyAddress"
                block
                link
                size="md"
                variant="secondary"
                @click="copyHash(item.contentHash)"
              >
                <v-icon name="ri-clipboard-line" />
              </i-button>
              <template #body>Copied!</template>
            </i-tooltip>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { copyToClipboard, searchByKey } from "@matterlabs/zksync-nuxt-core/utils";
import { ZkNFTBalances } from "@matterlabs/zksync-nuxt-core/types";
import { Address } from "zksync/build/types";
import { getCIDFromContentHash } from "@/utils/nft";
import { NFTItem } from "@/store/nfts";

export default Vue.extend({
  data() {
    return {
      search: "",
    };
  },
  computed: {
    accountStateLoading(): boolean {
      return this.$store.getters["zk-account/accountStateLoading"];
    },
    accountStateRequested(): boolean {
      return this.$store.getters["zk-account/accountStateRequested"];
    },
    zkBalances(): ZkNFTBalances {
      return this.$store.getters["zk-balances/nfts"];
    },
    displayedList(): ZkNFTBalances {
      return searchByKey(this.zkBalances, this.search);
    },
    hasDisplayedBalances(): boolean {
      return Object.keys(this.displayedList).length !== 0;
    },
    isSearching(): boolean {
      return !!this.search.trim();
    },
    nftDataLoading(): { [key: string]: boolean } {
      return this.$store.getters["nfts/getNFTsLoading"];
    },
    nftData(): { [key: string]: NFTItem } {
      return this.$store.getters["nfts/getNFTs"];
    },
    nftLoading(): { [tokenID: number]: boolean } {
      return Object.fromEntries(
        Object.entries(this.zkBalances).map((e) => {
          const nftCID = getCIDFromContentHash(e[1].contentHash);
          if (!nftCID) {
            return [e[0], false];
          }
          return [e[0], this.nftDataLoading[nftCID]];
        })
      );
    },
  },
  watch: {
    zkBalances: {
      immediate: true,
      handler(val: ZkNFTBalances | undefined) {
        if (val) {
          for (const nft in val) {
            const CID = getCIDFromContentHash(val[nft].contentHash);
            if (CID) {
              this.$store.dispatch("nfts/requestNFT", { cid: CID });
            }
          }
        }
      },
    },
  },
  methods: {
    copyHash(address: Address) {
      copyToClipboard(address);
    },
    getImageFromNFT(contentHash: string) {
      const nftCID = getCIDFromContentHash(contentHash);
      if (nftCID && this.nftData[nftCID] && this.nftData[nftCID].exists) {
        return this.nftData[nftCID].image;
      }
    },
  },
});
</script>

<style lang="scss">
.contactsListContainer .nftItem {
  height: 80px;
  grid-template-columns: 65px 1fr max-content;

  .nftImageSide {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    &,
    .userImg {
      display: flex;
      height: 62px;
      width: 62px;
      justify-content: center;
      align-items: center;
      background-color: #e2e2e2;
      border-radius: 50%;
      transition: background-color $transition1;

      &.userImg .ov-icon {
        fill: #828282;
        transition: fill $transition1;
      }

      img {
        border-radius: 50%;
      }
    }

    .nftStatus {
      position: absolute;
      width: 25px;
      height: 25px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: $white;
      border-radius: 50%;
      right: 0;
      bottom: 0;
      box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.25);

      .nftStatusIcon {
        transform: scale(0.9);

        &.verified {
          color: $green;
        }

        &.committed {
          color: #aa935d;
        }

        &.inProgress {
          color: $gray;
        }
      }
    }
  }
}

body.inkline.-dark {
  .contactsListContainer .nftItem .nftImageSide {
    &,
    .userImg {
      background-color: rgba(159, 166, 178, 0.2);

      &.userImg .ov-icon {
        fill: #fff;
      }
    }
  }
}
</style>
