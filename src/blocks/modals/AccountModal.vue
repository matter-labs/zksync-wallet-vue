<template>
  <div class="accountModalContainer">
    <i-modal v-model="renameWalletModal" class="prevent-close" size="md">
      <template slot="header">Rename wallet</template>
      <div>
        <i-input ref="nameInput" v-model="walletName" size="lg" placeholder="Name" type="name" maxlength="18" @keyup.enter="renameWallet()" />
        <i-button block size="lg" variant="secondary" class="_margin-top-1" @click="renameWallet()">Save</i-button>
      </div>
    </i-modal>

    <i-modal v-model="accountModal" size="md">
      <template slot="header">
        <b>{{ accountName }}</b>
      </template>
      <div>
        <wallet-address :wallet="accountAddress" />
        <vue-qrcode v-if="accountAddress" class="addressQR" :value="accountAddress" :margin="1" :scale="6" />
      </div>
      <template slot="footer">
        <a class="modalFooterBtn" :href="accountZkScanUrl" target="_blank">
          <v-icon name="ri-external-link-line" />
          <span>View in block explorer</span>
        </a>
        <div class="modalFooterBtn" @click="renameWalletOpen">
          <v-icon name="ri-pencil-line" />
          <span>Rename wallet</span>
        </div>
        <div class="modalFooterBtn" @click="logout()">
          <v-icon name="ri-link-unlink-m" />
          <span>Disconnect wallet</span>
        </div>
      </template>
    </i-modal>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  data() {
    return {
      renameWalletModal: false,
      walletName: this.$accessor.account.name,
    };
  },
  computed: {
    accountName(): string {
      return this.$accessor.account.name as string;
    },
    accountAddress(): string {
      return this.$accessor.account.address ?? "";
    },
    accountZkScanUrl(): string {
      return this.$accessor.account.zkScanUrl as string;
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
              (this.$refs.nameInput as Vue)?.$el?.querySelector("input")?.focus();
            }
          });
        } else {
          this.walletName = this.accountName;
        }
      },
    },
  },
  methods: {
    logout(): void {
      this.accountModal = false;
      this.$nextTick(async () => {
        await this.$accessor.wallet.logout(false);
        await this.$router.push("/");
      });
    },
    renameWalletOpen(): void {
      this.accountModal = false;
      this.renameWalletModal = true;
    },
    renameWallet(): void {
      this.$accessor.account.setName(this.walletName);
      this.renameWalletModal = false;
      this.walletName = this.accountName;
    },
    togglePopup(): void {
      this.$accessor.setAccountModalState(true);
    },
  },
});
</script>
