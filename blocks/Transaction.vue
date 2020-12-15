<template>
    <div class="transactionPage">
        <i-modal v-model="cantFindTokenModal" size="md">
            <template slot="header">Can't find a token</template>
            <div>
                <p>zkSync currently supports the most popular tokens, we will be adding more over time. <a href="//zksync.io/contact.html" target="_blank" rel="noopener noreferrer">Let us know what tokens you need</a>!</p>
            </div>
        </i-modal>
        <i-modal v-model="saveContactModal" size="md">
            <template slot="header">Save contact</template>
            <div>
                <div class="_padding-bottom-1">Contact name</div>
                <i-input size="lg" v-model="saveContactInput" placeholder="Name" maxlength="20" />
                <div class="modalError _margin-top-1" v-if="saveContactModalError">{{saveContactModalError}}</div>
                <i-button class="_margin-top-1" block variant="secondary" size="lg" @click="saveContact()">Save</i-button>
            </div>
        </i-modal>
        <div class="tileBlock" v-if="success===true">
            <div class="tileHeadline h3">
                <span>{{type==='withdraw'?'Withdraw':'Transfer'}}</span>
            </div>
            <a class="_display-block _text-center" target="_blank" :href="`https://${blockExplorerLink}/transactions/${transactionHash}`">Link to the transaction <i class="fas fa-external-link"></i></a>
            <checkmark />
            <p class="_text-center _margin-top-0">Your {{type==='withdraw'?'withdrawal':'transaction'}} will be processed shortly. Use the link below to track the progress.</p>
            <div class="totalAmount smaller _margin-top-2">
                <div class="amount">
                    <span>Recepient:</span>
                    <span class="totalPrice" v-if="isOwnAddress">Own account</span>
                    <span class="totalPrice" v-else-if="choosedContact">{{choosedContact.name}}</span>
                </div>
                <wallet-address :wallet="inputAddress" />
            </div>
            <div class="totalAmount _margin-top-1">
                <div class="headline">Amount:</div>
                <div class="amount">{{choosedToken.symbol}} {{formatMax(transactionAmount)}} <span class="totalPrice">~${{(transactionAmount*choosedToken.tokenPrice).toFixed(2)}}</span></div>
            </div>
            <div class="totalAmount smaller _margin-top-1">
                <div class="headline">Fee:</div>
                <div class="amount">{{choosedToken.symbol}} {{formatMax(transactionFee)}} <span class="totalPrice">~${{(transactionFee*choosedToken.tokenPrice).toFixed(2)}}</span></div>
            </div>
            <i-button block size="lg" variant="secondary" class="_margin-top-2" to="/account">Ok</i-button>
        </div>
        <div class="tileBlock" v-else-if="mainLoading===true">
            <div class="tileHeadline h3">{{type==='withdraw'?'Withdraw':'Transfer'}}</div>
            <p class="_display-block _text-center _margin-top-1" v-if="openedTab==='main' && tip">{{tip}}</p>
            <div class="nothingFound _padding-y-2" v-if="mainLoading===true">
                <i-loader size="md" :variant="$inkline.config.variant === 'light' ? 'dark' : 'light'" />
            </div>
        </div>
        <div class="tileBlock" v-else-if="openedTab==='main'">
            <div class="tileHeadline h3">{{type==='withdraw'?'Withdraw':'Transfer'}}</div>

            <div class="_padding-bottom-1">Address</div>
            <i-input size="lg" v-model="inputAddress" placeholder="0x address" maxlength="42" />
            <i-row class="_margin-top-1">
                <i-column xs="12" :md="canSaveContact?7:12" v-if="!choosedContact && !isOwnAddress">
                    <i-button @click="openedTab='contactsList'" block link variant="secondary">Select from contacts</i-button>
                </i-column>
                <i-column xs="12" :md="canSaveContact?7:12" v-else>
                    <i-button @click="openedTab='contactsList'" block link variant="secondary">{{isOwnAddress?'Own account':choosedContact.name}}&nbsp;&nbsp;<i class="far fa-angle-down"></i></i-button>
                </i-column>
                <i-column xs="12" md="5">
                    <i-button @click="saveContactModal=true" block link variant="secondary" v-if="canSaveContact">Save to contacts</i-button>
                </i-column>
            </i-row>

            <br>

            <div class="_padding-bottom-1">Amount / asset</div>
            <i-input size="lg" placeholder="0.00" type="number" v-model="inputTotalSum">
                <i-button @click="openedTab='tokenList'" block link variant="secondary" slot="append" v-if="!choosedToken">Select token</i-button>
                <i-button class="selectedTokenBtn" @click="openedTab='tokenList'" block link variant="secondary" slot="append" v-else>{{choosedToken.symbol}}&nbsp;&nbsp;<i class="far fa-angle-down"></i></i-button>
            </i-input>
            <div class="_display-flex _justify-content-space-between _margin-top-1" v-if="choosedToken">
                <div class="totalPrice">~${{(inputTotalSum*choosedToken.tokenPrice).toFixed(2)}}</div>
                <div class="maxAmount" @click="inputTotalSum=transactionMaxAmount>0?transactionMaxAmount:0">Max: {{transactionMaxAmount>0?transactionMaxAmount:0}}</div>
            </div>
            <div class="errorText _text-center _margin-top-1" v-if="choosedToken && inputTotalSum>transactionMaxAmount">
                Not enough {{choosedToken.symbol}} to perform a transaction
            </div>

            <i-radio-group class="_margin-top-2" v-model="fastWithdraw" v-if="choosedToken && type==='withdraw'">
                <i-radio :value="false">Normal withdraw (Fee: {{feesObj.normal}} {{choosedToken.symbol}}).<br>Processing time: {{getTimeString(withdrawTime.normal)}}</i-radio>
                <i-radio :value="true">Fast withdraw (Fee: {{feesObj.fast}} {{choosedToken.symbol}}).<br>Processing time: {{getTimeString(withdrawTime.fast)}}</i-radio>
            </i-radio-group>

            <div class="errorText _text-center _margin-top-1" v-if="mainError">{{mainError}}</div>

            <i-button block size="lg" variant="secondary" class="_margin-top-1" @click="commitTransaction()" :disabled="!inputTotalSum || !choosedToken || inputTotalSum>transactionMaxAmount">{{type==='withdraw'?'Withdraw':'Transfer'}}</i-button>
            <div class="_text-center _margin-top-1" v-if="feesObj && choosedToken && isAddressValid">
                Fee:
                <span class="totalPrice" v-if="feesLoading">Loading...</span>
                <span v-else>{{feesObj[fastWithdraw===true?'fast':'normal']}} {{choosedToken.symbol}} <span class="totalPrice">~${{(feesObj[fastWithdraw===true?'fast':'normal']*choosedToken.tokenPrice).toFixed(2)}}</span></span>
            </div>

        </div>
        <div class="tileBlock tokensTile" v-else-if="openedTab==='tokenList'">
            <div class="tileHeadline h3">
                <span>Balances in L2</span>
                <i-tooltip>
                    <i @click="openedTab='main'" class="fas fa-times"></i>
                    <template slot="body">Close</template>
                </i-tooltip>
            </div>
            <div class="nothingFound" v-if="tokensLoading===true">
                <i-loader size="md" :variant="$inkline.config.variant === 'light' ? 'dark' : 'light'" />
            </div>
            <template v-else>
                <i-input v-model="tokenSearch" placeholder="Filter balances in L2" maxlength="10">
                    <i slot="prefix" class="far fa-search"></i>
                </i-input>
                <div class="tokenListContainer">
                    <div class="tokenItem" v-for="item in displayedTokenList" :key="item.symbol" @click="chooseToken(item)">
                        <div class="tokenLabel">{{item.symbol}}</div>
                        <div class="rightSide">
                            <div class="balance">{{item.balance}}</div>
                        </div>
                    </div>
                    <div class="nothingFound" v-if="tokenSearch && displayedTokenList.length===0">
                        <span>Your search <b>"{{tokenSearch}}"</b> did not match any tokens</span>
                    </div>
                    <div class="nothingFound" v-else-if="displayedTokenList.length===0">
                        <span>No balances yet. Please make a deposit or request money from someone!</span>
                    </div>
                </div>
                <i-button @click="cantFindTokenModal=true" block link size="lg" variant="secondary" class="_margin-top-1">Can't find a token?</i-button>
            </template>
        </div>
        <div class="tileBlock contactTile" v-else-if="openedTab==='contactsList'">
            <div class="tileHeadline h3">
                <span>Contacts</span>
            </div>
            <i-input v-model="contactSearch" placeholder="Filter contacts" maxlength="20" v-if="contactSearch.trim() || displayedContactsList.length!==0">
                <i slot="prefix" class="far fa-search"></i>
            </i-input>
            
            <div class="contactsListContainer">
                <div class="nothingFound" v-if="!contactSearch.trim() && displayedContactsList.length===0">
                    <span>The contact list is empty</span>
                </div>
                <div class="nothingFound" v-else-if="displayedContactsList.length===0">
                    <span>Your search <b>"{{contactSearch}}"</b> did not match any contacts</span>
                </div>
                <template v-else>
                    <div class="contactItem" @click.self="chooseContact({name: 'Own account', address: ownAddress})" v-if="type==='withdraw'">
                        <user-img :wallet="ownAddress" />
                        <div class="contactInfo">
                            <div class="contactName">Own account</div>
                            <div class="contactAddress">{{ownAddress}}</div>
                        </div>
                    </div>
                    <div class="contactItem" v-for="(item, index) in displayedContactsList" :key="index" @click.self="chooseContact(item)">
                        <user-img :wallet="item.address" />
                        <div class="contactInfo">
                            <div class="contactName">{{item.name}}</div>
                            <div class="contactAddress">{{item.address}}</div>
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<script>
import { ethers } from 'ethers';
import * as zksync from 'zksync';

import walletData from '@/plugins/walletData.js';
import validations from '@/plugins/validations.js';
import handleFormatToken from '@/plugins/handleFormatToken.js';
import handleExponentialNumber from '@/plugins/handleExponentialNumbers.js';

import userImg from '@/components/userImg.vue';
import Checkmark from '@/components/Checkmark.vue';
import walletAddress from '@/components/walletAddress.vue';

const timeCalc = (timeInSec) => {
    const hours = Math.floor(timeInSec / 60 / 60);
    const minutes = Math.floor(timeInSec / 60) - hours * 60;
    const seconds = timeInSec - hours * 60 * 60 - minutes * 60;

    return {
        hours: hours,
        minutes: minutes,
        seconds: seconds,
    }
}
const handleTimeAmount = (time, string) => `${time} ${string}${time > 1 ? 's' : ''}`;

export default {
    props: {
        type: {
            type: String,
            default: '',
            required: true
        }
    },
    data() {
        return {
            openedTab: 'main',

            mainLoading: true,
            withdrawTime: false,
            feesObj: {},
            feesLoading: false,

            inputTotalSum: null,
            mainError: '',
            inputAddress: this.type==='withdraw'?walletData.get().syncWallet.address():'',
            fastWithdraw: false,

            contactSearch: '',
            contactsList: [],
            choosedContact: false,
            saveContactInput: '',
            saveContactModalError: '',
            saveContactModal: false,

            tokenSearch: '',
            tokensList: [],
            tokensLoading: false,
            choosedToken: false,
            cantFindTokenModal: false,
            
            tip: '',
            success: false,
            transactionHash: '',
            transactionAmount: null,
            transactionFee: null,
        }
    },
    components: {
        userImg,
        Checkmark,
        walletAddress
    },
    watch: {
        async openedTab(val) {
            if(val==='tokenList' && this.tokensLoading===false) {
                this.tokensLoading=true;
                try {
                    const list = await this.$store.dispatch('wallet/getzkBalances');
                    this.tokensList = list.map(e=>({...e,balance: this.formatMax(e.balance)}));
                } catch (error) {
                    console.log(error);
                }
                this.tokensLoading = false;
            }
        },
        inputAddress(val) {
            if(this.isAddressValid) {
                this.getFees();
            }
        }
    },
    computed: {
        displayedTokenList: function() {
            if(!this.tokenSearch.trim()){
                return this.tokensList;
            }
            return this.tokensList.filter(e=>(e.balance>0 && e.symbol.toLowerCase().includes(this.tokenSearch.trim().toLowerCase())));
        },
        displayedContactsList: function() {
            if(!this.contactSearch.trim()){
                return this.contactsList;
            }
            return this.contactsList.filter(e=>e.name.toLowerCase().includes(this.contactSearch.trim().toLowerCase()));
        },
        isAddressValid: function() {
            return validations.eth.test(this.inputAddress);
        },
        canSaveContact: function() {
            let isInContactList = false;
            for(const item of this.contactsList) {
                if(item.address===this.inputAddress) {
                    this.choosedContact=item;
                    isInContactList=true;
                    break;
                }
            }
            if(!isInContactList) {
                this.choosedContact=false;
            }
            return (!isInContactList && !this.isOwnAddress && !this.choosedContact && this.isAddressValid);
        },
        isOwnAddress: function() {
            return this.inputAddress.toLowerCase()===walletData.get().syncWallet.address().toLowerCase();
        },
        ownAddress: function() {
            return walletData.get().syncWallet.address();
        },
        transactionMaxAmount: function() {
            return this.formatMax(this.choosedToken.balance - (this.fastWithdraw===true?this.feesObj.fast:this.feesObj.normal));
        },
        blockExplorerLink: function() {
            return process.env.APP_ZKSYNC_BLOCK_EXPLORER;
        }
    },
    methods: {
        getFormatedAmount: function(token, amount) {
            return handleExponentialNumber(+handleFormatToken(token, +amount));
        },
        formatMax: function(val) {
            if(val===undefined){return 0}
            val = String(val).toString();
            let parts = val.split('.');
            if(parts.length>1) {
                if(parts[1].length>8) {
                    parts[1]=parts[1].substr(0,8);
                }
            }
            return parseFloat(parts.join('.'));
        },
        chooseToken: async function(token) {
            this.tokensLoading=true;
            this.choosedToken=token;
            await this.getFees();
            this.tokensLoading=false;
            this.openedTab='main';
        },
        chooseContact: function(contact) {
            this.choosedContact=contact;
            this.inputAddress=contact.address;
            this.openedTab='main';
        },
        getWidthdrawTime: async function() {
            this.mainLoading=true;
            this.withdrawTime = await this.$store.dispatch('wallet/getWithdrawalProcessingTime');
            this.mainLoading=false;
        },
        getFees: async function() {
            if(!this.isAddressValid){
                this.feesObj=false;
                return;
            }
            this.feesLoading=true;
            const wallet = walletData.get().syncWallet;
            const tokenSymbol = this.choosedToken?this.choosedToken.symbol:"ETH";
            this.feesObj = await this.$store.dispatch('wallet/getFees', {address: this.inputAddress, symbol: tokenSymbol, type: this.type});
            this.feesLoading=false;
        },
        getTimeString: function(time) {
            let { hours, minutes, seconds } = timeCalc(time);
            return `${hours ? handleTimeAmount(hours, 'hour') : ''} ${minutes ? handleTimeAmount(minutes, 'minute') : ''} ${seconds ? handleTimeAmount(seconds, 'second') : ''}`;
        },
        getContactsList: function() {
            try {
                const walletAddress = walletData.get().syncWallet.address();
                if(window.localStorage.getItem('contacts-'+walletAddress)) {
                    var contactsList = JSON.parse(window.localStorage.getItem('contacts-'+walletAddress));
                    if(Array.isArray(contactsList)) {
                        this.contactsList=contactsList;
                    }
                }
            } catch (error) {
                console.log(error);
            }
        },
        saveContact: function() {
            if(this.saveContactInput.trim().length===0) {
                this.saveContactModalError=`Name can't be empty`;
                return;
            }
            else {
                this.saveContactModalError='';
            }
            try {
                this.getContactsList();
                for(let a=0; a<this.contactsList.length; a++) {
                    if(this.contactsList[a].address.toLowerCase()===this.inputAddress.toLowerCase()) {
                        this.contactsList.splice(a,1);
                        break;
                    }
                }
                this.contactsList.push({name: this.saveContactInput.trim(), address: this.inputAddress});
                window.localStorage.setItem('contacts-'+walletData.get().syncWallet.address(), JSON.stringify(this.contactsList));
                this.getContactsList();
                this.saveContactModal=false;
                this.saveContactInput='';
                this.saveContactModalError='';
            } catch (error) {
                console.log(error);
            }
        },

        commitTransaction: async function() {
            if(!this.isAddressValid) {
                this.mainError="Inputed address doesn't match ethereum address format";
                return this.mainLoading=false;
            }
            else {
                this.mainError='';
            }
            try {
                this.mainLoading=true;
                if(!this.inputTotalSum || !this.choosedToken || this.inputTotalSum>this.transactionMaxAmount || !this.isAddressValid) {return this.mainLoading=false}
                var syncWallet = walletData.get().syncWallet;
                var syncProvider = walletData.get().syncProvider;
                if(!syncProvider.transport.ws.isOpened) {
                    await syncProvider.transport.ws.open();
                }
                if(this.type==='withdraw') {
                    await this.withdraw(syncWallet, syncProvider);
                }
                else {
                    await this.transfer(syncWallet, syncProvider);
                }
            } catch (error) {
                if(!error.message || !error.message.includes('User denied')){
                    this.mainError=error.message;
                }
                console.log('Transaction error', error);
            }
            this.mainLoading=false;
            this.tip='';
        },
        withdraw: async function(syncWallet, syncProvider) {
            const fee = await syncProvider.getTransactionFee(this.fastWithdraw?'FastWithdraw':'Withdraw',this.inputAddress,this.choosedToken.symbol);
            this.tip='Confirm the transaction to withdraw';
            const withdrawTransaction = await syncWallet.withdrawFromSyncToEthereum(
                {
                    ethAddress: this.inputAddress,
                    token: this.choosedToken.symbol,
                    amount: ethers.BigNumber.from((await zksync.closestPackableTransactionAmount(syncWallet.provider.tokenSet.parseToken(this.choosedToken.symbol, this.inputTotalSum.toString()))).toString()),
                    fee: zksync.closestPackableTransactionFee(fee.totalFee),
                    fastProcessing: this.fastWithdraw,
                },
            );
            this.transactionAmount = parseFloat(this.inputTotalSum);
            this.transactionHash=withdrawTransaction.txHash;
            this.transactionFee=this.getFormatedAmount(this.choosedToken.symbol, withdrawTransaction.txData.tx.fee);
            this.inputAddress=withdrawTransaction.txData.tx.to;
            this.tip='Processing...';
            await this.$store.dispatch('wallet/getInitialBalances', true).catch(err=>{console.log('getInitialBalances',err)});
            await this.$store.dispatch('wallet/getzkBalances', undefined, true).catch(err=>{console.log('getzkBalances',err)});
            await this.$store.dispatch('wallet/getTransactionsHistory', {force: true}).catch(err=>{console.log('getTransactionsHistory',err)});
            this.success=true;
        },
        transfer: async function(syncWallet, syncProvider) {
            await this.getFees();
            this.tip='Confirm the transaction to transfer';
            const transferTransaction = await syncWallet.syncTransfer(
                {
                    to: this.inputAddress,
                    token: this.choosedToken.symbol,
                    amount: ethers.BigNumber.from((await zksync.closestPackableTransactionAmount(syncWallet.provider.tokenSet.parseToken(this.choosedToken.symbol, this.inputTotalSum.toString()))).toString()),
                    fee: zksync.closestPackableTransactionFee(ethers.BigNumber.from(syncWallet.provider.tokenSet.parseToken(this.choosedToken.symbol, this.feesObj.normal.toString()).toString())),
                },
            );
            this.transactionAmount = parseFloat(this.inputTotalSum);
            this.transactionHash=transferTransaction.txHash;
            this.transactionFee=this.getFormatedAmount(this.choosedToken.symbol, transferTransaction.txData.tx.fee);
            this.inputAddress=transferTransaction.txData.tx.to;
            /* this.tip='Waiting for the transaction to be mined...';
            await transferTransaction.awaitReceipt(); */
            this.tip='Processing...';
            await this.$store.dispatch('wallet/getInitialBalances', true).catch(err=>{console.log('getInitialBalances',err)});
            await this.$store.dispatch('wallet/getzkBalances', undefined, true).catch(err=>{console.log('getzkBalances',err)});
            await this.$store.dispatch('wallet/getTransactionsHistory', {force: true}).catch(err=>{console.log('getTransactionsHistory',err)});
            this.success=true;
        },
    },
    mounted() {
        this.getContactsList();
        if(this.type==='withdraw') {
            this.getWidthdrawTime();
        }
        else {
            this.mainLoading=false;
        }
        /* this.checkSmth(); */
    },
}
</script>