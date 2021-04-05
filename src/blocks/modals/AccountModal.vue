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
        <b>{{ walletName }}</b>
      </template>
      <div>
        <wallet-address :wallet="accountAddress" />
        <vue-qrcode class="addressQR" :value="accountAddress" :margin="1" :scale="6" />
      </div>
      <template slot="footer">
        <a class="modalFooterBtn" :href="accountZkScanUrl" target="_blank">
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
    accountName(): string {
      return this.$store.getters["account/name"];
    },
    accountAddress(): string {
      return this.$store.getters["account/address"];
    },
    accountZkScanUrl(): string {
      return this.$store.getters["account/zkScanUrl"];
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
          this.walletName = this.accountName;
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
