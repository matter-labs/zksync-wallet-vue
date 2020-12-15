<template>
    <div>
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
        <div class="balancesBlock tileBlock">
            <div class="tileHeadline h3">
                <span>Balances in L2</span>
                <i @click="balanceInfoModal=true" class="fas fa-question"></i>
            </div>
            <div class="centerBlock" v-if="balances.length===0 && loading===false">
                <p class="tileText">No balances yet, please make a deposit or request money from someone!</p>
                <i-button block link size="lg" variant="secondary" class="_margin-top-1" to="/deposit">+ Deposit</i-button>
            </div>
            <div class="balances" v-else>
                <div v-if="!loading">
                    <div class="_display-flex _justify-content-space-between">
                        <i-button class="_padding-y-0" link size="lg" variant="secondary" to="/deposit">+ Deposit</i-button>
                        <i-button class="_padding-y-0" link size="lg" variant="secondary" to="/withdraw">- Withdraw</i-button>
                    </div>
                    <i-button block class="_margin-y-1" size="lg" variant="secondary" to="/transfer"><i class="fal fa-paper-plane"></i>&nbsp;&nbsp;Transfer</i-button>
                    <i-input v-model="search" placeholder="Filter tokens" maxlength="6">
                        <i slot="prefix" class="far fa-search"></i>
                    </i-input>
                </div>
                
                <div class="centerBlock" v-if="loading">
                    <i-loader size="md" :variant="$inkline.config.variant === 'light' ? 'dark' : 'light'" />
                </div>
                <div class="centerBlock" v-else-if="search && displayedList.length===0">
                    <span>Your search <b>"{{search}}"</b> did not match any tokens</span>
                </div>
                <div class="balancesList" v-else>
                    <nuxt-link :to="`/account/${item.symbol}`" class="balanceItem" v-for="(item,index) in displayedList" :key="index">
                        <div class="symbol">{{item.symbol}}</div>
                        <div class="rightSide">
                            <div class="total"><span class="balancePrice">~${{(item.tokenPrice*item.balance).toFixed(2)}}</span>&nbsp;&nbsp;{{item.balance}}</div>
                            <div class="status">
                                <i-tooltip>
                                    <i class="verified far fa-check-double" v-if="item.status==='Verified'"></i>
                                    <i class="commited far fa-check" v-else></i>
                                    <template slot="body">{{item.status}}</template>
                                </i-tooltip>
                            </div>
                        </div>
                    </nuxt-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            balances: [],
            search: '',
            loading: true,
            balanceInfoModal: false
        }
    },
    computed: {
        displayedList: function() {
            if(!this.search.trim()){
                return this.balances;
            }
            return this.balances.filter(e=>e.symbol.toLowerCase().includes(this.search.trim().toLowerCase()));
        }
    },
    methods: {
        getBalances: async function() {
            this.loading=true;
            const balances = await this.$store.dispatch('wallet/getzkBalances');
            this.balances=balances.filter(e=>e.balance>0);
            this.loading=false;
        }
    },
    mounted() {
        this.getBalances();
    },
}
</script>