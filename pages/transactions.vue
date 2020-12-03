<template>
    <div class="transactionsPage">
        <div class="tileBlock transactionsTile">
            <div class="tileHeadline h3">Transactions</div>
            <!-- <i-input v-model="search" placeholder="Filter transactions">
                <i slot="prefix" class="far fa-search"></i>
            </i-input> -->
            <div class="transactionsListContainer">
                <div class="nothingFound" v-if="loading===true">
                    <i-loader class="_display-block" size="md" :variant="$inkline.config.variant === 'light' ? 'dark' : 'light'" />
                </div>
                <div class="nothingFound" v-else-if="transactionsList.length===0">
                    <span>History is empty</span>
                </div>
                <div class="transactionItem" v-for="(item, index) in transactionsList" :key="index" v-else>
                    <div class="status">
                        <i-tooltip>
                            <i class="verified far fa-check-double" v-if="item.transactionStatus==='Verified'"></i>
                            <i class="commited far fa-check" v-else-if="item.transactionStatus==='Commited'"></i>
                            <i class="inProgress fad fa-spinner-third" v-else-if="item.transactionStatus==='In progress'"></i>
                            <template slot="body">{{item.transactionStatus}}</template>
                        </i-tooltip>
                    </div>
                    <div class="mainInfo">
                        <i-tooltip>
                            <div class="createdAt">{{getTimeAgo(item.created_at)}}</div>
                            <template slot="body">{{getFormatedTime(item.created_at)}}</template>
                        </i-tooltip>
                        <div class="amount">{{getFormatedAmount(item)}}</div>
                        <div class="token">{{item.tx.priority_op?item.tx.priority_op.token:item.tx.token}}</div>
                    </div>
                    <div class="actionInfo">
                        <div v-if="item.tx.type==='Withdraw'">
                            <div class="actionType">Withdrawn to:</div>
                            <nuxt-link class="actionValue" :to="`/contacts?w=${item.tx.to}`">{{getAddressName(item.tx.to)}}</nuxt-link>
                        </div>
                        <div v-else-if="item.tx.type==='Deposit'">
                            <div class="actionType">Deposit to:</div>
                            <div class="actionValue">Your account</div>
                        </div>
                        <div v-else-if="item.tx.type==='Transfer'">
                            <div class="actionType">
                                <span v-if="item.tx.to.toLowerCase()===walletAddressFull.toLowerCase()">Received from:</span>
                                <span v-else>Sent to:</span>
                            </div>
                            <nuxt-link class="actionValue" v-if="item.tx.to.toLowerCase()===walletAddressFull.toLowerCase()" :to="`/contacts?w=${item.tx.from}`">{{getAddressName(item.tx.from)}}</nuxt-link>
                            <nuxt-link class="actionValue" v-else :to="`/contacts?w=${item.tx.to}`">{{getAddressName(item.tx.to)}}</nuxt-link>
                        </div>
                    </div>
                    <a class="button -md -secondary -link" target="_blank" :href="getTransactionExplorerLink(item)"><i class="fas fa-external-link"></i></a>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import moment from 'moment';
import walletData from '@/plugins/walletData.js';
import handleExponentialNumber from '@/plugins/handleExponentialNumbers.js';
import handleFormatToken from '@/plugins/handleFormatToken.js';
export default {
    data() {
        return {
            transactionsList: [],
            loading: true,
            addressToNameMap: new Map()
        }
    },
    methods: {
        getAddressName: function(address) {
            if(this.addressToNameMap.has(address)) {
                return this.addressToNameMap.get(address);
            }
            else {
                return address.replace(address.slice(6, address.length - 3), '...');
            }
        },
        getTimeAgo: function(time) {
            return moment(time).fromNow();
        },
        getFormatedTime: function(time) {
            return moment(time).format('M/D/YYYY h:mm:ss A');
        },
        getFormatedAmount: function({tx: {type, priority_op, token, amount}}) {
            return handleExponentialNumber(+handleFormatToken(
                type === 'Deposit'
                ? (priority_op?.token)
                : (token),
                (type === 'Deposit' && priority_op) ? +priority_op.amount : +amount,
            ));
        },
        getTransactionExplorerLink: function(transaction) {
            return (transaction.tx.type === 'Deposit'?`https://${process.env.APP_ETH_BLOCK_EXPLORER}/tx`:`https://${process.env.APP_ZKSYNC_BLOCK_EXPLORER}/transactions`)+`/${transaction.hash}`;
        },
        getTransactionStatus: function(transaction) {
            if (transaction.verified) {
                return 'Verified';
            }
            /* else if (transaction.commited && transaction.tx.type === 'Withdraw') {
                return 'Commited';
            } */
            else if (transaction.commited) {
                return 'Commited';
            }
            else {
                return 'In progress';
                /* if (tx.tx.type === 'Deposit') {
                    status = status;
                }
                else {
                    if (!tx.commited && tx.tx.type === 'Withdraw') {
                        // status = 'Withdrawal in progress — it should take max. 60 min';
                        status =
                        handleTimeLeft().minutes < 0
                            ? 'Operation is taking a bit longer than usual, it should be right there!'
                            : `Max ${
                                isNaN(handleTimeLeft().timeLeft)
                                ? withdrawalTime
                                : `${handleCheckForHours}${minutesRelativelyToHours} min ${
                                    handleTimeLeft().seconds
                                    } sec`
                            }s left`;
                    }
                    else {
                        status = 'Transaction in progress';
                    }
                } */
            }
        },
        getTransactions: async function() {
            this.loading=true;
            try {
                const list = await this.$store.dispatch('wallet/getTransactionsHistory');
                /* console.log(list); */
                this.transactionsList = list.filter(e=>e.tx.type!=='ChangePubKey').map(e=>({...e,transactionStatus: this.getTransactionStatus(e)}));
            } catch (error) {
                console.log(error);
            }
            this.loading = false;
        }
    },
    computed: {
        walletAddressFull: function() {
            return walletData.get().syncWallet.address();
        },
    },
    mounted() {
        this.getTransactions();
        try {
            var contactsList = JSON.parse(window.localStorage.getItem('contacts-'+this.walletAddressFull));
            for(const item of contactsList) {
                this.addressToNameMap.set(item.address,item.name);
            }
        } catch (error) {
            console.log(error);
        }
    },
}
</script>