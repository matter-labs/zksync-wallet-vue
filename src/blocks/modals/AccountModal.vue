<template>
  <div class="accountModalContainer">
    <i-modal v-model="renameWalletModal" class="prevent-close" size="md">
      <template slot="header"> Rename wallet</template>
      <div>
        <i-input ref="nameInput" v-model="walletName" size="lg" placeholder="Name" type="name" maxlength="18" @keyup.enter="renameWallet()" />
        <i-button block size="lg" variant="secondary" class="_margin-top-1" @click="renameWallet()">Save</i-button>
      </div>
    </i-modal>

    <i-modal v-model="accountModal" size="md">
      <template slot="header">
        <b>{{ currentWalletName }}</b>
      </template>
      <div>
        <wallet-address :wallet="walletAddressFull" />
        <vue-qrcode class="addressQR" :value="walletAddressFull" :margin="1" :scale="6" />
      </div>
      <template slot="footer">
        <a class="modalFooterBtn" :href="`${getZkScanBaseUrl}/accounts/${walletAddressFull}`" target="_blank">
          <i class="ri-external-link-line"></i>
          <span>View in block explorer</span>
        </a>
        <div class="modalFooterBtn" @click="renameWalletOpen()">
          <i class="ri-pencil-line"></i>
          <span>Rename wallet</span>
        </div>
        <div class="modalFooterBtn" @click="logout()">
          <i class="ri-link-unlink-m"></i>
          <span>Disconnect wallet</span>
        </div>
      </template>
    </i-modal>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import walletAddress from "@/components/walletAddress.vue";
import { APP_ZK_SCAN } from "@/plugins/build";
import VueQrcode from "vue-qrcode";

export default Vue.extend({
  components: {
    walletAddress,
    VueQrcode,
  },
  data() {
    return {
      renameWalletModal: false,
      walletName: this.$store.getters["account/name"],
    };
  },
  computed: {
    currentWalletName(): string {
      return this.$store.getters["account/name"];
    },
    walletAddressFull(): string {
      return this.$store.getters["account/address"];
    },
    getZkScanBaseUrl(): string {
      return APP_ZK_SCAN;
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
  watch: {
    renameWalletModal: {
      immediate: true,
      handler(val: boolean): void {
        if (!process.client) {
          return;
        }
        if (val) {
          this.$nextTick(() => {
            if (this.$refs.nameInput) {
              // @ts-ignore: Unreachable code error
              this.$refs.nameInput.$el.querySelector("input").focus();
            }
          });
        } else {
          this.walletName = this.currentWalletName;
        }
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
    renameWalletOpen(): void {
      this.accountModal = false;
      this.renameWalletModal = true;
    },
    renameWallet(): void {
      this.$store.commit("account/setName", this.walletName);
      this.renameWalletModal = false;
    },
    togglePopup(): void {
      this.$store.commit("setAccountModalState", true);
    },
  },
});
</script>

<style lang="scss">
.accountModalContainer {
  position: absolute;
  pointer-events: none;

  & > * {
    pointer-events: all;
  }
}
</style>
