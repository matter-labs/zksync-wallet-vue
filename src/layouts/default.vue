<template>
  <div class="defaultLayout">
    <logging-in-loader />
    <div v-if="!loggingIn && loggedIn">
      <header-component ref="header" />
      <i-modal v-model="renameWalletModal" class="prevent-close" size="md">
        <template slot="header"> Rename wallet</template>
        <div>
          <i-input ref="nameInput" v-model="walletName" size="lg" placeholder="Name" type="name" maxlength="18" @keyup.enter="renameWallet()" />
          <i-button block size="lg" variant="secondary" class="_margin-top-1" @click="renameWallet()">Save</i-button>
        </div>
      </i-modal>

      <i-modal v-model="accountModal" size="md">
        <template slot="header">
          <b>{{ walletName }}</b>
        </template>
        <div>
          <wallet-address :wallet="walletAddressFull" />
          <vue-qrcode class="addressQR" :value="walletAddressFull" :margin="1" :scale="6" />
        </div>
        <template slot="footer">
          <a class="modalFooterBtn" :href="`${getZkScanBaseUrl}/accounts/${walletAddressFull}`" target="_blank">
            <i class="fas fa-external-link" />
            <span>View in block explorer</span>
          </a>
          <div class="modalFooterBtn" @click="renameWalletOpen()">
            <i class="fas fa-pen" />
            <span>Rename wallet</span>
          </div>
          <div class="modalFooterBtn" @click="logout()">
            <i class="far fa-unlink"></i>
            <span>Disconnect wallet</span>
          </div>
        </template>
      </i-modal>
      <div class="routerContainer">
        <transition name="fade" mode="out-in">
          <nuxt />
        </transition>
      </div>
      <footer-component />
    </div>
  </div>
</template>

<script type="ts">
import footerComponent from "@/blocks/Footer.vue";
import headerComponent from "@/blocks/Header.vue";
import loggingInLoader from "@/blocks/LoggingInLoader.vue";
import VueQrcode from "vue-qrcode";

import Vue from "vue";
import { APP_ZK_SCAN } from "@/plugins/build";

export default Vue.extend({
  components: {
    headerComponent,
    footerComponent,
    loggingInLoader,
    VueQrcode,
  },
  asyncData() {},
  data() {
    return {
      renameWalletModal: false,
      walletName: "",
      accountModal: false,
    };
  },
  computed: {
    loggingIn() {
      return this.$store.getters["account/loader"];
    },
    loggedIn() {
      return this.$store.getters["account/loggedIn"];
    },
    walletAddressFull() {
      return this.$store.getters["account/address"];
    },
    getZkScanBaseUrl() {
      return APP_ZK_SCAN;
    },
  },
  watch: {
    accountModal(value) {
      this.$store.commit("setAccountModalState", !!value);
    },
    $route: {
      immediate: true,
      handler(val, oldVal) {
        if (!oldVal) {
          return this.$nextTick(() => {
            document.documentElement.scrollTop = 0;
          });
        }
        if (val.path !== oldVal.path) {
          this.$nextTick(() => {
            const lastScroll = this.$store.getters["scroll/getLastScroll"];
            document.documentElement.scrollTop = lastScroll !== false ? lastScroll.y : 0;
          });
        }
      },
    },
  },
  mounted() {
    if (process.client) {
      window.history.scrollRestoration = "manual";
    }
    if (localStorage.getItem("colorTheme")) {
      this.$inkline.config.variant = localStorage.getItem("colorTheme");
    }
  },
  methods: {
    renameWalletOpen() {
      this.accountModal = false;
      this.renameWalletModal = true;
    },
    renameWallet() {
      this.renameWalletModal = false;
      if (process.client && this.walletName.length > 0 && this.walletName !== this.walletAddressFull) {
        window.localStorage.setItem(this.walletAddressFull, this.walletName);
      }
    },
  },
});
</script>
