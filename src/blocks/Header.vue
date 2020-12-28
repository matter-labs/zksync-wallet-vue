<template>
  <header>
    <i-container>
      <div class="firstRow">
        <nuxt-link to="/account">
          <logo/>
        </nuxt-link>
        <div class="linksContainer">
          <a target="_blank" class="mainLink desktopOnly" :href="getZkScanBaseUrl">Block explorer <i class="fas fa-external-link"></i></a>
          <a target="_blank" class="mainLink desktopOnly" href="//zksync.io/faq/intro.html">Docs <i
              class="fas fa-external-link"></i></a>
          <div class="userDropdown" @click="accountModal=true">
            <div class="address">{{ walletName }}</div>
            <div class="userImgContainer">
              <user-img :wallet="walletAddressFull"/>
            </div>
            <div class="dropdownArrow">
              <i class="far fa-angle-down"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="secondRow">
        <nuxt-link to="/account">My wallet</nuxt-link>
        <nuxt-link to="/contacts">Contacts</nuxt-link>
        <nuxt-link to="/transactions">Transactions</nuxt-link>
      </div>
    </i-container>

    <i-modal v-model="renameWalletModal" class="prevent-close" size="md">
      <template slot="header">
        Rename wallet
      </template>
      <div>
        <i-input v-model="walletName" size="lg" placeholder="Name" type="name" maxlength="18"/>
        <i-button block size="lg" variant="secondary" class="_margin-top-1" @click="renameWallet()">Save</i-button>
      </div>
    </i-modal>

    <i-modal v-model="accountModal" size="md">
      <template slot="header">
        <b>{{ walletName }}</b>
      </template>
      <div>
        <wallet-address :wallet="walletAddressFull"/>
        <vue-qrcode class="addressQR" :value="walletAddressFull" :margin="1" :scale="6"/>
      </div>
      <template slot="footer">
        <a class="modalFooterBtn" :href="`${getZkScanBaseUrl}/accounts/${walletAddressFull}`" target="_blank">
          <i class="fas fa-external-link"></i>
          <span>View in block explorer</span>
        </a>
        <div class="modalFooterBtn" @click="renameWalletOpen()">
          <i class="fas fa-pen"></i>
          <span>Rename wallet</span>
        </div>
        <div class="modalFooterBtn" @click="logout()">
          <i class="far fa-unlink"></i>
          <span>Disconnect wallet</span>
        </div>
      </template>
    </i-modal>
  </header>
</template>

<script>
import logo from "@/blocks/Logo.vue";
import userImg from "@/components/userImg.vue";
import walletAddress from "@/components/walletAddress.vue";
import { APP_ZK_SCAN } from "@/plugins/build";
import VueQrcode from "vue-qrcode";

export default {
  components: {
    logo,
    userImg,
    walletAddress,
    VueQrcode,
  },
  data() {
    return {
      renameWalletModal: false,
      walletName: "",
    };
  },
  computed: {
    walletAddressFull: function () {
      return this.$store.getters["account/address"];
    },
    getZkScanBaseUrl: function () {
      return APP_ZK_SCAN;
    },
    accountModal: {
      get: function() {
        return this.$store.getters['getAccountModalState'];
      },
      set: function(val) {
        this.$store.commit('setAccountModalState', val);
        return val;
      },
    }
  },
  watch: {
    renameWalletModal: {
      immediate: true,
      handler() {
        if (!process.client) {
          return false;
        }
        const walletName = window.localStorage.getItem(this.walletAddressFull);
        if (walletName && walletName !== this.walletAddressFull) {
          this.walletName = walletName;
        } else {
          let address = this.walletAddressFull;
          if (address.length > 16) {
            address = address.substr(0, 11) + "..." + address.substr(address.length - 5, address.length - 1);
          }
          this.walletName = address;
        }
      },
    },
  },
  methods: {
    logout: function () {
      this.accountModal = false;
      this.$nextTick(async ()=>{
        await this.$store.dispatch("wallet/logout");
        await this.$router.push("/");
      });
    },
    renameWalletOpen: function () {
      this.accountModal = false;
      this.renameWalletModal = true;
    },
    renameWallet: function () {
      this.renameWalletModal = false;
      if (process.client && this.walletName.length > 0 && this.walletName !== this.walletAddressFull) {
        window.localStorage.setItem(this.walletAddressFull, this.walletName);
      }
    },
  },
};
</script>
