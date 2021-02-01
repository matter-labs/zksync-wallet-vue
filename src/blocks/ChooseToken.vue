<template>
    <div class="chooseTokenBlock">
        <div v-if="loading===true" class="centerBlock">
            <loader/>
        </div>
        <template v-else>
            <i-input ref="tokenSymbolInput" v-model="search" :placeholder="`Filter balances in ${tokensType}`" maxlength="10">
                <i slot="prefix" class="far fa-search"></i>
            </i-input>
            <div class="tokenListContainer">
                <div v-for="item in displayedList" :key="item.symbol" class="tokenItem" @click="chooseToken(item)">
                    <div class="tokenSymbol">{{ item.symbol }}</div>
                    <div class="rightSide">
                        <div class="balance">{{ item.balance }}</div>
                    </div>
                </div>
                <div v-if="search && displayedList.length === 0" class="centerBlock">
                    <span>Your search <b>"{{ search }}"</b> did not match any tokens</span>
                </div>
                <div v-else-if="displayedList.length === 0" class="centerBlock">
                    <span>No balances yet. Please make a deposit or request money from someone!</span>
                </div>
            </div>
            <i-button block link size="lg" variant="secondary" class="_margin-top-1" @click="$store.dispatch('openModal', 'NoTokenFound')">
                Can't find a token?
            </i-button>
            <no-token-found />
        </template>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import utils from "@/plugins/utils";
import { Balance } from "@/plugins/types";
import NoTokenFound from "@/blocks/modals/NoTokenFound.vue";
export default Vue.extend({
    props: {
        onlyAllowed: {
            type: Boolean,
            default: false,
            required: false
        },
        tokensType: {
            type: String,
            default: 'L2',
            required: false
        }
    },
    data() {
        return {
            search: '',
            loading: false,
        }
    },
    components: {
        NoTokenFound
    },
    computed: {
        balances: function(): Array<Balance> {
            if(this.tokensType==='L2') {
                return this.$store.getters['wallet/getzkBalances'];
            }
            else {
                return this.$store.getters['wallet/getInitialBalances'];
            }
        },
        displayedList: function (): Array<Balance> {
            var list = this.balances;
            if (!this.search.trim()) {
                list = this.balances;
            }
            else {
                list = this.balances.filter((e: Balance) => e.symbol.toLowerCase().includes(this.search.trim().toLowerCase()));
            }
            if(this.onlyAllowed) {
                list=list.filter(e => e.restricted===false);
            }
            return list;
        },
    },
    methods: {
        chooseToken: function(token: Balance): void {
            this.$emit('choosed', token);
        },
        getTokenList: async function (): Promise<void> {
            this.loading = true;
            if(this.tokensType==='L2') {
                await this.$store.dispatch("wallet/getzkBalances");
            }
            else {
                await this.$store.dispatch("wallet/getInitialBalances");
            }
            this.loading = false;
        },
    },
    mounted() {
        this.getTokenList();
    },
});
</script>