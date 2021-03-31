<template>
  <header>
    <i-container>
      <i-row>
        <i-column :xs="12" :md="3" class="_padding-left-0 _display-flex _justify-content-start">
          <nuxt-link to="/account">
            <logo />
          </nuxt-link>
        </i-column>
        <i-column :xs="12" :md="6" class="_padding-y-0">
          <div class="linksContainer _margin-x-auto">
            <nuxt-link class="headerLink" to="/account">My wallet</nuxt-link>
            <nuxt-link class="headerLink" to="/deposit">Deposit</nuxt-link>
            <nuxt-link class="headerLink" to="/contacts">Contacts</nuxt-link>
            <nuxt-link class="headerLink" to="/transactions">Transactions</nuxt-link>
          </div>
        </i-column>
        <i-column :xs="12" :md="3" class="_margin-left-auto _padding-right-0 _display-flex _justify-content-end">
          <div class="linksContainer">
            <div class="userDropdown" @click="togglePopup">
              <div class="userDropdownAddress">
                <div class="walletLabel">Wallet</div>
                <div class="userAddress">
                  <div class="address">{{ walletName }}</div>
                </div>
              </div>
              <div class="userImgContainer">
                <user-img :wallet="walletAddressFull" />
              </div>
              <div class="dropdownArrow">
                <i class="far fa-angle-down" />
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
import Vue from "vue";
import logo from "@/blocks/Logo.vue";
import userImg from "@/components/userImg.vue";
import accountModal from "@/blocks/modals/AccountModal.vue";

export default Vue.extend({
  components: {
    logo,
    userImg,
    accountModal,
  },
  computed: {
    walletName(): string {
      return this.$store.getters["account/name"];
    },
    walletAddressFull(): string {
      return this.$store.getters["account/address"];
    },
    accountModal: {
      get(): boolean {
        return this.$store.getters.getAccountModalState;
      },
      set(val: boolean): boolean {
        this.$store.commit("setAccountModalState", val);
        return val;
      },
    },
  },
  methods: {
    logout(): void {
      this.accountModal = false;
      this.$nextTick(async () => {
        await this.$store.dispatch("wallet/logout");
        await this.$router.push("/");
      });
    },
    togglePopup(): void {
      this.$store.commit("setAccountModalState", true);
    },
  },
});
</script>
