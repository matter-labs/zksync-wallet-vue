<template>
  <header class="loggedInHeader">
    <i-container>
      <i-row>
        <i-column :xs="6" :md="3" class="_padding-left-0 _display-flex _justify-content-start">
          <nuxt-link class="logoLinkContainer" to="/account"> <logo :is-zk-sync-logo="false" /> </nuxt-link>
        </i-column>
        <i-column :xs="0" :md="6" class="_padding-y-0 pagesContainerRow">
          <div class="pagesContainer linksContainer _margin-x-auto">
            <nuxt-link class="headerLink" to="/account">
              <i class="mobileOnly ri-wallet-line"></i>
              <span>My wallet</span>
            </nuxt-link>
            <nuxt-link class="headerLink" to="/contacts">
              <i class="mobileOnly ri-contacts-line"></i>
              <span>Contacts</span>
            </nuxt-link>
            <nuxt-link class="headerLink" to="/transactions">
              <i class="mobileOnly ri-history-line"></i>
              <span>Transactions</span>
            </nuxt-link>
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
                <i class="ri-arrow-down-s-line"></i>
              </div>
            </div>
          </div>
        </i-column>
      </i-row>
    </i-container>
    <account-modal />
  </header>
</template>

<script lang="ts">
import logo from "@/blocks/Logo.vue";
import userImg from "@/components/userImg.vue";
import accountModal from "@/blocks/modals/AccountModal.vue";
import Vue from "vue";

export default Vue.extend({
  components: {
    logo,
    userImg,
    accountModal,
  },
  computed: {
    walletName(): string {
      return this.$accessor.account.name || "";
    },
    walletAddressFull(): string {
      return this.$accessor.account.address || "";
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
        await this.$accessor.wallet.logout();
        await this.$router.push("/");
      });
    },
    togglePopup(): void {
      this.$accessor.setAccountModalState(true);
    },
  },
});
</script>
