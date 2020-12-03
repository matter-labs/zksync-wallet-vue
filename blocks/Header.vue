<template>
    <header>
        <i-container>
            <div class="firstRow">
                <logo />
                <div class="linksContainer">
                    <a target="_blank" class="mainLink desktopOnly" href="//zkscan.io">Block explorer <i class="fas fa-external-link"></i></a>
                    <a target="_blank" class="mainLink desktopOnly" href="//zksync.io/faq/intro.html">Docs <i class="fas fa-external-link"></i></a>
                    <div class="userDropdown" @click="infoModal=true">
                        <div class="address">{{walletName}}</div>
                        <div class="userImgContainer">
                            <user-img :wallet="walletAddressFull" />
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

        <i-modal v-model="renameWalletModal" size="md">
            <template slot="header">
                Rename wallet
            </template>
            <div>
                <i-input size="lg" placeholder="Name" type="name" v-model="walletName" maxlength="18" />
                <i-button block size="lg" variant="secondary" class="_margin-top-1" @click="renameWallet()">Save</i-button>
            </div>
        </i-modal>

        <i-modal v-model="infoModal" size="md">
            <template slot="header">
                <b>{{walletName}}</b>
            </template>
            <div>
                <wallet-address :wallet="walletAddressFull" />
                <vue-qrcode class="addressQR" :value="walletAddressFull" :margin="1" :scale="6" />
            </div>
            <template slot="footer">
                <a class="modalFooterBtn" :href="'https://zkscan.io/accounts/'+walletAddressFull" target="_blank">
                    <i class="fas fa-external-link"></i>
                    <span>View in block explorer</span>
                </a>
                <div class="modalFooterBtn" @click="renameWalletOpen()">
                    <i class="fal fa-pen"></i>
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
import VueQrcode from 'vue-qrcode'

import logo from '@/blocks/Logo.vue';
import walletAddress from '@/components/walletAddress.vue';
import userImg from '@/components/userImg.vue';
import walletData from '@/plugins/walletData.js';
export default {
    data() {
        return {
            infoModal: false,
            renameWalletModal: false,
            walletName: '',
        }
    },
    components: {
        logo,
        userImg,
        walletAddress,
        VueQrcode
    },
    computed: {
        walletAddressFull: function() {
            return walletData.get().syncWallet.address();
        },
    },
    watch: {
        renameWalletModal: {
            immediate: true,
            handler(val) {
                const walletName = window.localStorage.getItem(this.walletAddressFull);
                if(walletName && walletName!==this.walletAddressFull) {
                    this.walletName=walletName;
                }
                else {
                    var address = this.walletAddressFull;
                    if(address.length>16){
                        address = address.substr(0,11)+'...'+address.substr(address.length-5,address.length-1);
                    }
                    this.walletName=address;
                }
            }
        }
    },
    methods: {
        logout: async function() {
            this.infoModal=false;
            await this.$store.dispatch('wallet/logout');
            this.$router.push('/');
        },
        renameWalletOpen: function() {
            this.infoModal=false;
            this.renameWalletModal=true;
            this.$nextTick(()=>{
                this.walletName='';
            });
        },
        renameWallet: function() {
            this.renameWalletModal=false;
            if(this.walletName.length>0 && this.walletName!==this.walletAddressFull) {
                window.localStorage.setItem(this.walletAddressFull, this.walletName);
            }
        }
    },
}
</script>