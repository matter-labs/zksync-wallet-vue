<template>
  <i-layout-header class="loggedInHeader">
    <i-container>
      <i-row>
        <i-column :xs="6" :md="3" class="_padding-left-0 _display-flex _justify-content-start">
          <nuxt-link class="logoLinkContainer" to="/account">
            <block-logo :is-zk-sync-logo="true" />
          </nuxt-link>
        </i-column>
        <i-column :xs="0" :md="6" class="_padding-y-0 pagesContainerRow">
          <div class="pagesContainer linksContainer _margin-x-auto">
            <nuxt-link class="headerLink" to="/account">
              <v-icon class="mobileOnly" name="ri-wallet-line" />
              <span>Home</span>
            </nuxt-link>
            <nuxt-link class="headerLink" to="/account/nft">
              <v-icon class="mobileOnly" name="ri-gallery-line" />
              <span>NFTs</span>
            </nuxt-link>
            <nuxt-link class="headerLink" to="/contacts">
              <v-icon class="mobileOnly" name="ri-contacts-line" />
              <span>Contacts</span>
            </nuxt-link>
            <nuxt-link class="headerLink" to="/transaction/history">
              <v-icon class="mobileOnly" name="ri-history-line" />
              <span>History</span>
            </nuxt-link>
            <div class="mobileOnly headerLink _cursor-pointer" @click="footerModal = !footerModal">
              <v-icon class="mobileOnly" name="ri-more-2-fill" />
              <span>More</span>
            </div>
          </div>
        </i-column>
        <i-column :xs="6" :md="3" class="_margin-left-auto _padding-right-0 _display-flex _justify-content-end">
          <div class="linksContainer">
            <div class="userDropdown" @click="togglePopup">
              <div class="userDropdownAddress">
                <div class="walletLabel">Wallet</div>
                <div class="userAddress">
                  <div class="address">{{ walletName }}</div>
                </div>
              </div>
              <div class="userImgContainer">
                <user-img :wallet="walletAddressFull"></user-img>
              </div>
              <div class="dropdownArrow">
                <v-icon name="ri-arrow-down-s-line" />
              </div>
            </div>
          </div>
        </i-column>
      </i-row>
    </i-container>
    <block-modals-account-modal />
    <block-modals-footer-modal v-model="footerModal" />
    <block-modals-environment />
  </i-layout-header>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "Header",
  data() {
    return {
      footerModal: false,
    };
  },
  computed: {
    walletName(): string {
      return this.$store.getters["zk-account/name"];
    },
    walletAddressFull(): string {
      return this.$store.getters["zk-account/address"];
    },
    accountModal: {
      get(): boolean {
        return this.$accessor.getAccountModalState;
      },
      set(val: boolean): boolean {
        this.$accessor.setAccountModalState(val);
        return val;
      },
    },
  },
  methods: {
    logout(): void {
      this.accountModal = false;
      this.$nextTick(async () => {
        await this.$store.dispatch("zk-account/logout");
        await this.$router.push("/");
      });
    },
    togglePopup(): void {
      this.$accessor.setAccountModalState(true);
    },
  },
});
</script>
