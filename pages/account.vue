<template>
    <div class="walletPage">
        <i-modal v-model="walletInfoModal" size="md">
            <template slot="header">Wallet information</template>
            <div>
                <div>
                    <b>Your zkSync address is the same as your Ethereum account address.</b>
                </div>
                <p>
                    As long as you control your Ethereum account you also own all the L2 balances under its address in zkSync. Nobody can freeze or take them away from you. Once your balance has been verified (), you can always recover your tokens from zkSync — even if its validators are ever shut down. <a href="//zksync.io/faq/security.html" target="_blank" rel="noopener noreferrer">Learn more.</a>
                </p>
            </div>
        </i-modal>
        <i-modal v-model="balanceInfoModal" size="md">
            <template slot="header">Balances in L2</template>
            <div>
                <div>
                    <b>zkSync is a Layer-2 protocol</b>
                </div>
                <p>
                    Your zkSync balances live in a separate space called Layer-2 (L2 for short). You won’t see them on <a href="//etherscan.io" target="_blank" rel="noopener noreferrer">etherscan.io</a> or in your Ethereum wallet, only in zkSync wallet and block explorer. Nevertheless, balances in zkSync are as secure as if though they were in L1 (the Ethereum mainnet). <a href="//zksync.io/faq/security.html" target="_blank" rel="noopener noreferrer">Learn more.</a>
                </p>
                <p>
                    You can move your balances from L1 into zkSync by making a Deposit
                </p>
                <p>
                    To move them back from zkSync to L1 you can make a Withdraw
                </p>
            </div>
        </i-modal>
        <div class="tileBlock">
            <div class="tileHeadline h3">
                <span>My wallet</span>
                <i @click="walletInfoModal=true" class="fas fa-question"></i>
            </div>
            <wallet-address :wallet="walletAddress" />
        </div>
        <div class="tileBlock">
            <div class="tileHeadline h3">
                <span>Balances in L2</span>
                <i @click="balanceInfoModal=true" class="fas fa-question"></i>
            </div>
            <p class="tileText">No balances yet, please make a deposit or request money from someone!</p>
            <i-button block link size="lg" variant="secondary" class="_margin-top-1" to="/deposit">+ Deposit</i-button>
        </div>
    </div>
</template>

<script>
import walletData from '@/plugins/walletData.js';
import walletAddress from '@/components/walletAddress.vue';
export default {
    data() {
        return {
            walletInfoModal: false,
            balanceInfoModal: false,
        }
    },
    components: {
        walletAddress
    },
    computed: {
        walletAddress: function() {
            return walletData.get().syncWallet.address();
        }
    },
}
</script>