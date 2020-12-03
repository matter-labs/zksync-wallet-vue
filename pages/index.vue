<template>
    <div class="indexPage _padding-x-2">
        <i-container>
            <i-row center>
                <logo class="_padding-top-3" />
            </i-row>
            <i-row center>
                <span class="h2 _font-weight-normal">Trustless, scalable crypto payments</span>
            </i-row>
            <i-row center>
                <span class="h5 _font-weight-normal">Connect a wallet</span>
            </i-row>
            <i-row center class="_padding-top-1">
                <!-- <div class="tileContainer _padding-x-2 _padding-top-1" @click="burnerWallet()">
                    <div class="tile">
                        <img src="@/assets/imgs/wallets/burner.png" alt="Burner Wallet">
                    </div>
                    <div class="tileName">BurnerWallet</div>
                </div>
                <div class="tileContainer _padding-x-2 _padding-top-1">
                    <div class="tile">
                        <img src="@/assets/imgs/wallets/walletconnect.png" alt="WalletConnect">
                    </div>
                    <div class="tileName">WalletConnect</div>
                </div> -->
                <div class="tileContainer _padding-x-2 _padding-top-1" @click="customWallet()">
                    <div class="tile">
                        <img src="@/assets/imgs/wallets/external.png" alt="External">
                        <i class="tileIcon fas fa-lock"></i>
                    </div>
                    <div class="tileName">External</div>
                </div>
                <!-- <i-popover class="externalWalletPopover" placement="right">
                    <div class="tileContainer _padding-x-2 _padding-top-1" @click="lockVisible=true" :class="{'lockVisible': lockVisible===true}">
                        <div class="tile">
                            <img src="@/assets/imgs/wallets/external.png" alt="External">
                            <i class="tileIcon fas fa-lock"></i>
                        </div>
                        <div class="tileName">External</div>
                    </div>
                    <template slot="body">
                        <div>
                            <div class="h5">
                                <b>Better</b> External Wallet
                            </div>
                            <p class="description">External Wallet functionality is under reconstruction in order to improve your experience.</p>
                            <i-button size="md" variant="secondary" @click="contactInfoShown=!contactInfoShown">Contact us to withdraw funds</i-button>
                            <div class="contactInfo" v-if="contactInfoShown===true">
                                <div class="infoDesciption">Until the release we’ll serve withdrawals 7 days a week from 10 a.m. till 7p.m.</div>
                                <div class="iconsBlock">
                                    <a href="https://twitter.com/the_matter_labs" target="_blank" class="twitterWithdraw" title="DM us on twitter"><i class="fab fa-twitter"></i></a>
                                    <a href="https://discord.gg/px2aR7w" target="_blank" class="discordWithdraw" title="Use Discord"><i class="fab fa-discord"></i></a>
                                    <a href="mailto:hello@matter-labs.io" target="_blank" class="emailWithdraw" title="Mail to hello@matter-labs.io"><i class="fas fa-envelope"></i></a>
                                </div>
                            </div>
                        </div>
                    </template>
                </i-popover> -->
            </i-row>
        </i-container>
    </div>
</template>

<script>
import logo from '@/blocks/Logo.vue';

export default {
    layout: 'index',
    components: {
        logo
    },
    data() {
        return {
            lockVisible: false,
            contactInfoShown: false,
        }
    },
    methods: {
        burnerWallet: function() {
            this.$router.push('/account');
        },
        customWallet: async function() {
            const onboard = this.$store.getters['wallet/getOnboard'];
            onboard.config({
                darkMode: this.$inkline.config.variant === 'light' ? false : true
            });
            const walletSelect = await onboard.walletSelect();
            if(walletSelect===false){return}
            const walletCheck = await onboard.walletCheck();
            if(walletCheck===false){return}

            const refreshWalletTry = await this.$store.dispatch('wallet/walletRefresh');
            if(refreshWalletTry!==true) {
                await this.$store.dispatch('wallet/logout');
            }
            else {
                this.$router.push('/account');
            }
        }
    },
}
</script>