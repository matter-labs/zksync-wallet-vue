<template>
    <div class="depositPage">
        <i-modal v-model="cantFindTokenModal" size="md">
            <template slot="header">Can't find a token</template>
            <div>
                <p>zkSync currently supports the most popular tokens, we will be adding more over time. <a href="//zksync.io/contact.html" target="_blank" rel="noopener noreferrer">Let us know what tokens you need</a>!</p>
                <!-- <i-button block variant="secondary" size="lg" @click="addContact=false">Save</i-button> -->
            </div>
        </i-modal>
        <div class="tileBlock" v-if="tokenSelectionOpened===false">
            <div class="tileHeadline h3">Deposit</div>
            <!-- <i-button link variant="primary">Primary</i-button> -->
            <!-- <i-input v-model="search" placeholder="Filter transactions">
                <i slot="prefix" class="far fa-search"></i>
            </i-input>
            <p class="tileText _padding-top-1">History is empty</p> -->
            <div class="_padding-bottom-1">Amount / asset</div>
            <i-input size="lg" placeholder="0.00" type="number" v-model="inputTotalSum">
                <i-button @click="tokenSelectionOpened=true" block link variant="secondary" slot="append" v-if="!choosedToken">Select token</i-button>
                <i-button class="selectedTokenBtn" @click="tokenSelectionOpened=true" block link variant="secondary" slot="append" v-else>{{choosedToken.symbol}}&nbsp;&nbsp;<i class="far fa-angle-down"></i></i-button>
            </i-input>
            <i-button block size="lg" variant="secondary" class="_margin-top-1">Deposit</i-button>
        </div>
        <div class="tileBlock tokensTile" v-else>
            <div class="tileHeadline h3">
                <span>Balances in L1</span>
                <i-tooltip>
                    <i @click="tokenSelectionOpened=false" class="fas fa-times"></i>
                    <template slot="body">Close</template>
                </i-tooltip>
            </div>
            <i-loader class="_display-block _margin-x-auto _margin-top-1" size="md" :variant="$inkline.config.variant === 'light' ? 'dark' : 'light'" v-if="tokensLoading===true" />
            <template v-else>
                <i-input v-model="search" placeholder="Filter balances in L1" maxlength="10">
                    <i slot="prefix" class="far fa-search"></i>
                </i-input>
                <div class="tokenListContainer">
                    <div class="tokenItem" v-for="item in displayedTokenList" :key="item.symbol" @click="choosedToken=item;tokenSelectionOpened=false;">
                        <div class="tokenLabel">{{item.symbol}}</div>
                        <div class="rightSide">
                            <div class="balance">{{item.balance}}</div>
                        </div>
                    </div>
                    <div class="nothingFound" v-if="displayedTokenList.length===0">
                        <span>Your search <b>"{{search}}"</b> did not match any tokens</span>
                    </div>
                </div>
                <i-button @click="cantFindTokenModal=true" block link size="lg" variant="secondary" class="_margin-top-1">Can't find a token?</i-button>
            </template>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            search: '',
            inputTotalSum: null,
            tokenSelectionOpened: false,
            tokensLoading: false,
            tokensList: [],
            choosedToken: false,
            cantFindTokenModal: false,
        }
    },
    watch: {
        inputTotalSum(val) {
            
        },
        async tokenSelectionOpened(val) {
            if(val===true && this.tokensLoading===false) {
                this.tokensLoading=true;
                try {
                    const list = await this.$store.dispatch('wallet/getInitialBalances');
                    this.tokensList = list;
                } catch (error) {
                    console.log(error);
                }
                this.tokensLoading = false;
            }
        },
    },
    computed: {
        displayedTokenList: function() {
            if(!this.search.trim()){
                return this.tokensList;
            }
            return this.tokensList.filter(e=>e.symbol.toLowerCase().includes(this.search.trim().toLowerCase()));
        }
    },
}
</script>