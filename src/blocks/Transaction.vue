<template>
    <div class="transactionPage">

        <!-- Choose token -->
        <i-modal v-model="chooseTokenModal" size="md">
            <template slot="header">Choose token</template>
            <choose-token @choosed="chooseToken($event)" />
        </i-modal>

        <!-- Choose fee token -->
        <i-modal v-model="chooseFeeTokenModal" size="md">
            <template slot="header">Choose fee token</template>
            <choose-token @choosed="chooseFeeToken($event)" :onlyAllowed="true" />
        </i-modal>

        <!-- Transfer warning modal -->
        <i-modal v-model="transferWithdrawWarningModal" class="prevent-close" size="md">
            <template slot="header">Transfer warning</template>
            <div>
                <div class="_padding-bottom-1">
                    You are about to transfer money to an address that doesn't have a zkSync balance yet. The transfer will happen inside zkSync L2. If you want to move money from zkSync to the mainnet, please use the <nuxt-link :to="`/withdraw?w=${inputedAddress}`">Withdraw</nuxt-link> function instead.
                </div>
                <i-checkbox v-model="transferWithdrawWarningCheckmark">Do not show this again</i-checkbox>
                <i-button class="_margin-top-1" block variant="secondary" size="lg" @click="warningDialogProceedTransfer();">Transfer inside zkSync</i-button>
            </div>
        </i-modal>

        <!-- Loading block -->
        <loading-block :headline="transactionTypeName" v-if="loading===true">
            <a v-if="transactionInfo.hash" class="_display-block _text-center" target="_blank"
                :href="transactionInfo.explorerLink">
                Link to the transaction <i class="fas fa-external-link"/>
            </a>
            <p v-if="tip" class="_display-block _text-center">{{ tip }}</p>
        </loading-block>

        <!-- Transaction success block -->
        <success-block :headline="transactionTypeName" :type="type" :recepient="transactionInfo.recepient" :amount="transactionInfo.amount" :fee="transactionInfo.fee" :txLink="transactionInfo.explorerLink" :continueBtnFunction="transactionInfo.continueBtnFunction" @continue="successBlockContinue" v-else-if="transactionInfo.success===true">
            <p class="_text-center _margin-top-0" v-if="transactionInfo.type==='ActivateAccount'">
                Your account has been successfully unlocked and now you can proceed to {{type}}.
            </p>
            <p class="_text-center _margin-top-0" v-else>
                Your {{ type }} will be processed shortly. Use the transaction link to track the progress.
            </p>
        </success-block>

        <!-- Main Block -->
        <div class="transactionTile tileBlock" v-else>
            <div class="tileHeadline withBtn h3">
                <nuxt-link :to="(fromRoute && fromRoute.fullPath!==$route.fullPath)?fromRoute:'/account'" class="returnBtn">
                    <i class="far fa-long-arrow-alt-left"></i>
                </nuxt-link>
                <div>
                    {{ transactionTypeName }}
                </div>
            </div>

            <div class="_padding-top-1 inputLabel">Address</div>
            <address-input ref="addressInput" v-model="inputedAddress" @enter="commitTransaction()" />
            <choose-contact v-model="choosedContact" :displayOwnAddress="type==='withdraw'" :address.sync="inputedAddress" />

            <div class="_padding-top-1 inputLabel">Amount</div>
            <amount-input ref="amountInput" v-model="inputedAmount" autofocus :maxAmount="maxAmount" :token="choosedToken?choosedToken:undefined" :type="type" @chooseToken="chooseTokenModal=true" @enter="commitTransaction()" />
        
            <i-radio-group v-if="choosedToken && type==='withdraw' && (!choosedFeeToken || choosedFeeToken.symbol===choosedToken.symbol) && feesObj" v-model="transactionMode" class="_margin-top-2">
                <i-radio value="normal">
                    Normal withdraw
                    <span class="feeAmount">
                        (
                        <strong>Fee:</strong>
                        <span v-if="feesObj && feesObj['normal']">
                            {{ feesObj && feesObj["normal"] | formatToken(feeToken.symbol) }}
                            <span class="tokenSymbol">
                                {{ feeToken.symbol }}
                            </span>
                            <span class="totalPrice">
                                {{ feesObj["normal"] | formatUsdAmount(feeToken.tokenPrice, feeToken.symbol) }}
                            </span>
                        </span>
                        <span v-else class="totalPrice">Loading...</span>
                        ).
                    </span>
                    <br class="desktopOnly">
                    Processing time: {{ withdrawTime.normal | getTimeString }}
                </i-radio>
                <i-radio value="fast">
                    Fast withdraw
                    <span class="feeAmount">
                        (
                        <strong>Fee:</strong>
                        <span v-if="feesObj && feesObj['fast']">
                            {{ feesObj && feesObj["fast"] |formatToken(feeToken.symbol) }}
                            <span class="tokenSymbol">{{ feeToken.symbol }}</span>
                            <span class="totalPrice">
                                {{ feesObj["fast"] | formatUsdAmount(feeToken.tokenPrice, feeToken.symbol) }}
                            </span>
                        </span>
                        <span v-else class="totalPrice">Loading...</span>
                        ).
                    </span>
                    <br class="desktopOnly">
                    Processing time: {{ withdrawTime.fast | getTimeString }}
                </i-radio>
            </i-radio-group>
            <div v-else-if="choosedToken && type==='withdraw' && feesObj" class="secondaryText _text-center _margin-top-1">
                Only normal withdraw ({{ withdrawTime.normal | getTimeString }}) is available when using different fee token
            </div>

            <div class="errorText _text-center _margin-top-1">
                {{ error }}
            </div>
            
            <i-button block size="lg" variant="secondary" class="_margin-top-1" :disabled="buttonDisabled" @click="commitTransaction()">
                <template v-if="ownAccountUnlocked">
                    <i v-if="type==='withdraw'" class="fas fa-hand-holding-usd"></i>
                    <i v-else-if="type==='transfer'" class="fas fa-paper-plane"></i>
                </template>
                {{ !ownAccountUnlocked?'Activate Account':transactionTypeName }}
            </i-button>

            <div v-if="!enoughFeeToken" class="errorText _text-center _margin-top-1">
                Not enough <span class="tokenSymbol">{{ feeToken.symbol }}</span> to pay the fee
            </div>
            <div v-if="cantFindFeeToken===true && feesObj && choosedToken && inputedAddress" class="errorText _text-center _margin-top-1">
                <span class="tokenSymbol">{{ choosedToken.symbol }}</span> is not suitable for paying fees<br>
                No available tokens on your balance to pay the fee
            </div>
            <div v-else>
                <div v-if="(feesObj || feesObj[transactionMode] || feesLoading) && choosedToken && inputedAddress" class="_text-center _margin-top-1">
                    Fee:
                    <span v-if="feesLoading" class="secondaryText">Loading...</span>
                    <span v-else>
                        {{ feesObj[transactionMode] | formatToken(feeToken.symbol) }} <span class="tokenSymbol">{{ feeToken.symbol }}</span>
                        <span class="secondaryText">
                            {{ feesObj[transactionMode] | formatUsdAmount(feeToken.tokenPrice, feeToken.symbol) }}
                        </span>
                    </span>
                </div>
                <div v-if="!ownAccountUnlocked && feeToken && (activateAccountFee || activateAccountFeeLoading)" class="_text-center _margin-top-1">
                    Account Activation:
                    <span v-if="activateAccountFeeLoading" class="secondaryText">Loading...</span>
                    <span v-else>
                        {{ activateAccountFee | formatToken(feeToken.symbol) }} <span class="tokenSymbol">{{ feeToken.symbol }}</span>
                        <span class="secondaryText">
                            {{ activateAccountFee | formatUsdAmount(feeToken.tokenPrice, feeToken.symbol) }}
                        </span>
                    </span>
                </div>
                <div v-if="((feesObj || feesObj[transactionMode] || feesLoading) && choosedToken && inputedAddress) || !ownAccountUnlocked" class="_text-center _margin-top-1">
                    <span class="linkText" @click="chooseFeeTokenModal=true">Choose fee token</span>
                </div>
            </div>
            <p class="tileTextBg _margin-top-1" v-if="!ownAccountUnlocked">To start using your account you need to register your public key once. This operation costs
                15000 gas on-chain. In the future, we will eliminate this step by verifying ETH signatures with zero-knowledge
                proofs. Please bear with us!
            </p>
        </div>

    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { BigNumber } from "ethers";
import { Contact, Balance, Address, FeesObj, TransactionReceipt, Provider, Transaction, GweiBalance } from "@/plugins/types";
import { walletData } from "@/plugins/walletData";
import { APP_ZKSYNC_BLOCK_EXPLORER } from "@/plugins/build";
import utils from '@/plugins/utils';
import { transaction, withdraw } from "@/plugins/walletActions/transaction";

import loadingBlock from '@/components/LoadingBlock.vue';
import successBlock from '@/components/SuccessBlock.vue';
import addressInput from '@/components/AddressInput.vue';
import chooseContact from '@/blocks/ChooseContact.vue';
import chooseToken from '@/blocks/ChooseToken.vue';
import amountInput from '@/components/AmountInput.vue';

var zksync = null as any;

export default Vue.extend({
    props: {
        type: {
            type: String,
            default: "",
            required: true
        },
        fromRoute: {
            type: Object,
            default: undefined,
            required: false,
        },
    },
    data() {
        return {
            /* Loading block */
            loading: false,
            tip: '',

            /* Choose token */
            chooseTokenModal: false,
            chooseFeeTokenModal: false,

            /* Transaction success block */
            transactionInfo: {
                success: false,
                continueBtnFunction: false,
                hash: '',
                type: '',
                explorerLink: '',
                recepient: {
                    address: '' as Address,
                    name: '',
                } as any,
                amount: {
                    amount: '' as GweiBalance,
                    token: false as (false | Balance)
                } as any,
                fee: {
                    amount: '' as GweiBalance,
                    token: false as (false | Balance)
                },
            },

            /* Warning Modal */
            transferWithdrawWarningModal: false,

            /* Main Block */
            inputedAddress: '',
            choosedContact: false as (false | Contact),
            inputedAmount: '',
            choosedToken: false as (Balance | false),
            choosedFeeToken: false as (Balance | false),
            feesObj: false as (FeesObj | false),
            feesLoading: false,
            transactionMode: 'normal',
            cantFindFeeToken: false,
            withdrawTime: false,
            transferWithdrawWarningCheckmark: false,
            activateAccountFeeLoading: false,
            activateAccountFee: undefined as (undefined | GweiBalance),
            error: "",
        }
    },
    computed: {
        transactionTypeName: function(): string {
            switch (this.type) {
                case 'withdraw':
                    return 'Withdraw';
                    break;
                case 'transfer':
                    return 'Transfer';
                    break;
            
                default:
                    return '';
                    break;
            }
        },
        maxAmount: function(): string {
            if(!this.choosedToken) {
                return "0"
            }
            else {
                // @ts-ignore: Unreachable code error
                if((!this.choosedFeeToken || this.choosedToken.symbol===this.choosedFeeToken.symbol) && !this.feesLoading && this.feesObj[this.transactionMode]) {
                    // @ts-ignore: Unreachable code error
                    let amount = this.choosedToken.rawBalance.sub(this.feesObj[this.transactionMode]);
                    if(!this.ownAccountUnlocked && !this.activateAccountFeeLoading && this.activateAccountFee) {
                        amount = amount.sub(this.activateAccountFee);
                    }
                    return zksync!.closestPackableTransactionAmount(amount).toString();
                }
                else {
                    // @ts-ignore: Unreachable code error
                    let amount = this.choosedToken.rawBalance;
                    if(!this.ownAccountUnlocked && !this.activateAccountFeeLoading && this.activateAccountFee) {
                        amount = amount.sub(this.activateAccountFee);
                    }
                    return zksync!.closestPackableTransactionAmount(amount).toString();
                }
            }
        },
        feeToken: function(): Balance {
            if(this.choosedFeeToken) {
                return this.choosedFeeToken;
            }
            else {
                return this.choosedToken as Balance;
            }
        },
        enoughFeeToken: function(): boolean {
            if(!this.ownAccountUnlocked && !this.activateAccountFeeLoading && this.activateAccountFee) {
                // @ts-ignore: Unreachable code error
                let feeAmount = BigNumber.from(this.activateAccountFee);
                return BigNumber.from(this.feeToken.rawBalance).gt(feeAmount);
            }
            if(this.cantFindFeeToken || !this.inputedAddress || !this.choosedToken || !this.feesObj || !this.choosedFeeToken || this.feesLoading || this.choosedFeeToken.symbol===this.choosedToken.symbol) {
                return true;
            }
            // @ts-ignore: Unreachable code error
            let feeAmount = BigNumber.from(this.feesObj[this.transactionMode]);
            if(!this.ownAccountUnlocked && !this.activateAccountFeeLoading && this.activateAccountFee) {
                feeAmount = feeAmount.add(this.activateAccountFee);
            }
            return BigNumber.from(this.choosedFeeToken.rawBalance).gt(feeAmount);
        },
        buttonDisabled: function(): boolean {
            if(!this.ownAccountUnlocked) {
                return !(this.feeToken && this.activateAccountFee && !this.activateAccountFeeLoading && this.enoughFeeToken);
            }
            return (!this.inputedAddress || !this.inputedAmount || !this.choosedToken || this.feesLoading || this.cantFindFeeToken || !this.enoughFeeToken);
        },
        ownAccountUnlocked: function(): boolean {
            return !this.$store.getters['wallet/isAccountLocked'];
        },
    },
    components: {
        loadingBlock,
        successBlock,
        addressInput,
        chooseContact,
        amountInput,
        chooseToken
    },
    watch: {
        choosedContact: {
            deep: true,
            handler(val) {
                if(val && val.address) {
                    this.inputedAddress = val.address;
                }
                else {
                    this.inputedAddress = '';
                }
            }
        },
        inputedAddress(val) {
            this.getFees();
        },
    },
    methods: {
        chooseToken: function(token: Balance) {
            this.choosedToken = token;
            this.chooseTokenModal = false;
            this.transactionMode = 'normal';
            const balances = JSON.parse(JSON.stringify(this.$store.getters['wallet/getzkBalances'])).sort((a: Balance, b: Balance) => parseFloat(b.balance)-parseFloat(a.balance)) as Array<Balance>;
            if (!this.choosedFeeToken && this.choosedToken.restricted === true) {
                var tokenFound = false;
                for (const feeToken of balances) {
                    if (feeToken.restricted === false) {
                        this.cantFindFeeToken = false;
                        this.choosedFeeToken = feeToken;
                        tokenFound = true;
                        break;
                    }
                }
                if(tokenFound===false) {
                    this.cantFindFeeToken = true;
                }
            } else {
                this.cantFindFeeToken = false;
            }
            this.getFees();
            this.getAccountActivationFee();
        },
        chooseFeeToken: function(token: Balance) {
            this.choosedFeeToken = token;
            this.chooseFeeTokenModal = false;
            this.getFees();
            this.getAccountActivationFee();
        },
        getFees: async function (): Promise<void> {
            if(!this.choosedToken || !this.inputedAddress || this.feeToken.restricted) {
                this.feesObj = false;
                return;
            }
            this.feesLoading = true;
            try {
                this.feesObj = await this.$store.dispatch("wallet/getFees", {
                    address: this.inputedAddress,
                    symbol: this.choosedToken.symbol,
                    feeSymbol: this.feeToken.symbol,
                    type: this.type,
                });
            } catch (error) {
                await this.$store.dispatch("toaster/error", error.message);
            }
            this.feesLoading = false;
        },
        getWithdrawalTime: async function (): Promise<void> {
            this.withdrawTime = await this.$store.dispatch("wallet/getWithdrawalProcessingTime");
        },
        commitTransaction: async function(): Promise<void> {
            console.log(this.ownAccountUnlocked);
            if(!this.inputedAmount && this.ownAccountUnlocked) {
                // @ts-ignore: Unreachable code error
                this.$refs.amountInput.emitValue(this.inputedAmount);
            }
            if(this.buttonDisabled){return}
            this.error = "";
            this.loading=true;
            try {
                if(!this.ownAccountUnlocked) {
                    await this.activateAccount();
                }
                else if (this.type==='withdraw') {
                    await this.withdraw();
                }
                else if (this.type==='transfer'){
                    await this.transfer();
                }
            } catch (error) {
                if (error.message) {
                    if (error.message.includes("User denied")) {
                        this.error = "";
                    } else {
                        if (error.message.includes("Fee Amount is not packable")) {
                            this.error = "Fee Amount is not packable";
                        }
                        else if (error.message.includes("Transaction Amount is not packable")) {
                            this.error = "Transaction Amount is not packable";
                        }
                        else if (error.message && String(error.message).length < 60) {
                            this.error = error.message;
                        }
                    }
                } else {
                    if (error.message && String(error.message).length < 60) {
                        this.error = error.message;
                    } else {
                        this.error = "Transaction error";
                    }
                }
            }
            this.tip='';
            this.loading=false;
        },
        withdraw: async function(): Promise<void> {
            const syncProvider = walletData.get().syncProvider as Provider;
            const txAmount = utils.parseToken((this.choosedToken as Balance).symbol, this.inputedAmount);
            this.tip = "Confirm the transaction to withdraw";
            const withdrawTransaction = await withdraw(
                this.inputedAddress,
                (this.choosedToken as Balance).symbol,
                this.feeToken.symbol,
                txAmount.toString(),
                this.transactionMode==='fast',
                // @ts-ignore: Unreachable code error
                this.feesObj[this.transactionMode],
                this.$store
            ) as Transaction;
            let receipt = {} as TransactionReceipt;
            this.transactionInfo.amount.amount = txAmount.toString();
            this.transactionInfo.amount.token = this.choosedToken as Balance;
            this.transactionInfo.fee.token = this.feeToken;
            if (!Array.isArray(withdrawTransaction)) {
                this.transactionInfo.hash = withdrawTransaction.txHash;
                this.transactionInfo.explorerLink = APP_ZKSYNC_BLOCK_EXPLORER+'/transactions/'+withdrawTransaction.txHash;
                this.transactionInfo.fee.amount = withdrawTransaction.txData.tx.fee;
                this.transactionInfo.recepient = {
                    address: withdrawTransaction.txData.tx.to,
                    name: this.choosedContact?this.choosedContact.name:''
                };
                this.tip = "Waiting for the transaction to be mined...";
                receipt = await withdrawTransaction.awaitReceipt();
            } else {
                this.transactionInfo.hash = withdrawTransaction[0].txHash;
                this.transactionInfo.explorerLink = APP_ZKSYNC_BLOCK_EXPLORER+'/transactions/'+withdrawTransaction[0].txHash;
                this.transactionInfo.fee.amount = withdrawTransaction[1].txData.tx.fee;
                this.transactionInfo.recepient = {
                    address: withdrawTransaction[0].txData.tx.to as string,
                    name: this.choosedContact?this.choosedContact.name:''
                };
                this.tip = "Waiting for the transaction to be mined...";
                receipt = await syncProvider.notifyTransaction(withdrawTransaction[0].txHash, "COMMIT");
            }
            this.transactionInfo.success = receipt.success as boolean;
            if(receipt.failReason) {
                throw new Error(receipt.failReason);
            }
        },
        transfer: async function(): Promise<void> {
            const transferWithdrawWarning = localStorage.getItem('canceledTransferWithdrawWarning');
            if(!transferWithdrawWarning && this.transferWithdrawWarningModal===false) {
                const accountUnlocked = await this.accountUnlocked(this.inputedAddress);
                if(accountUnlocked===false) {
                    this.transferWithdrawWarningModal=true;
                    this.loading = false;
                    return;
                }
            }
            this.tip = "Confirm the transaction to transfer";
            const txAmount = utils.parseToken((this.choosedToken as Balance).symbol, this.inputedAmount);
            // @ts-ignore: Unreachable code error
            const transferTransaction = await transaction(this.inputedAddress, (this.choosedToken as Balance).symbol, this.feeToken.symbol, txAmount.toString(), this.feesObj.normal, this.$store) as Transaction;
            this.transactionInfo.amount.amount = txAmount.toString();
            this.transactionInfo.amount.token = this.choosedToken as Balance;
            this.transactionInfo.fee.token = this.feeToken;
            let receipt = {} as TransactionReceipt;
            if (transferTransaction && !Array.isArray(transferTransaction)) {
                this.transactionInfo.hash = transferTransaction.txHash;
                this.transactionInfo.explorerLink = APP_ZKSYNC_BLOCK_EXPLORER+'/transactions/'+transferTransaction.txHash;
                this.transactionInfo.fee.amount = transferTransaction.txData.tx.fee;
                this.transactionInfo.recepient = {
                    address: transferTransaction.txData.tx.to,
                    name: this.choosedContact?this.choosedContact.name:''
                };
                this.tip = "Waiting for the transaction to be mined...";
                receipt = await transferTransaction.awaitReceipt();
            } else if(transferTransaction) {
                this.transactionInfo.hash = transferTransaction[0].txHash;
                this.transactionInfo.explorerLink = APP_ZKSYNC_BLOCK_EXPLORER+'/transactions/'+transferTransaction[0].txHash;
                this.transactionInfo.fee.amount = transferTransaction[1].txData.tx.fee;
                this.transactionInfo.recepient = {
                    address: transferTransaction[0].txData.tx.to,
                    name: this.choosedContact?this.choosedContact.name:''
                };
                this.tip = "Waiting for the transaction to be mined...";
                receipt = await transferTransaction[0].awaitReceipt();
            }
            this.transactionInfo.success = receipt.success as boolean;
            if(receipt.failReason) {
                throw new Error(receipt.failReason);
            }
        },
        accountUnlocked: async function(address: Address): Promise<boolean> {
            const state = await walletData.get().syncProvider!.getState(address);
            return state.id!==null;
        },
        warningDialogProceedTransfer: function(): void {
            if(this.transferWithdrawWarningCheckmark===true) {
                localStorage.setItem('canceledTransferWithdrawWarning', "true");
            }
            this.commitTransaction();
            this.$nextTick(()=>{
                setTimeout(() => {
                    this.transferWithdrawWarningModal=false;
                }, 100);
            });
        },
        getAccountActivationFee: async function (): Promise<void> {
            if (!this.feeToken && !this.ownAccountUnlocked) {
                return;
            }
            this.activateAccountFeeLoading = true;
            const syncWallet = walletData.get().syncWallet;
            const syncProvider = walletData.get().syncProvider;
            try {
                await this.$store.dispatch("wallet/restoreProviderConnection");
                const foundFee = await syncProvider?.getTransactionFee(
                {
                    ChangePubKey: {
                        onchainPubkeyAuth: syncWallet?.ethSignerType?.verificationMethod === "ERC-1271",
                    },
                },
                syncWallet?.address() || '',
                    this.feeToken.symbol,
                );
                this.activateAccountFee = foundFee!.totalFee.toString();
            } catch (error) {
                await this.$store.dispatch("toaster/error", error.message ? error.message : "Error while receiving an unlock fee");
            }
            this.activateAccountFeeLoading = false;
        },
        activateAccount: async function(): Promise<string> {
            if(this.activateAccountFee === undefined || !this.feeToken) {
                return "";
            }
            this.error = "";
            this.loading = true;
            try {
                this.clearTransactionInfo();
                const syncWallet = walletData.get().syncWallet;
                await this.$store.dispatch("wallet/restoreProviderConnection");
                this.tip = "Confirm the transaction to unlock this account";

                if (syncWallet?.ethSignerType?.verificationMethod === "ERC-1271") {
                const isOnchainAuthSigningKeySet = await syncWallet!.isOnchainAuthSigningKeySet();
                if (!isOnchainAuthSigningKeySet) {
                    const onchainAuthTransaction = await syncWallet!.onchainAuthSigningKey();
                    await onchainAuthTransaction?.wait();
                }

                const isSigningKeySet = await syncWallet!.isSigningKeySet();
                if (!isSigningKeySet) {
                    const changePubkey = await syncWallet?.setSigningKey({
                        feeToken: this.feeToken.symbol,
                        nonce: "committed",
                        onchainAuth: true,
                    });
                    console.log('changePubkey', changePubkey);
                    this.$store.dispatch('transaction/watchTransaction', {transactionHash: changePubkey.txHash, tokenSymbol: this.feeToken.symbol});
                    this.setTransactionInfo(changePubkey, true);
                    this.tip = "Waiting for the transaction to be mined...";
                    await changePubkey?.awaitReceipt();
                }
                } else {
                const isSigningKeySet = await syncWallet!.isSigningKeySet();
                if (!isSigningKeySet) {
                    const changePubkey = await syncWallet!.setSigningKey({
                        feeToken: this.feeToken.symbol,
                    });
                    console.log('changePubkey', changePubkey);
                    this.$store.dispatch('transaction/watchTransaction', {transactionHash: changePubkey.txHash, tokenSymbol: this.feeToken.symbol});
                    this.setTransactionInfo(changePubkey, true);
                    this.tip = "Waiting for the transaction to be mined...";
                    await changePubkey.awaitReceipt();
                }
                }
                const isSigningKeySet = await syncWallet?.isSigningKeySet();
                this.$store.commit("wallet/setAccountLockedState", isSigningKeySet === false);

                const newAccountState = await syncWallet?.getAccountState();
                walletData.set({ accountState: newAccountState });
                
                this.transactionInfo.success=true;
            } catch (error) {
                if (error.message && !error.message.includes("User denied")) {
                    this.error = error.message;
                }
            }
            this.loading = false;
            return "";
        },
        clearTransactionInfo: function() {
            this.transactionInfo = {
                success: false,
                continueBtnFunction: false,
                hash: '',
                type: '',
                explorerLink: '',
                recepient: {
                    address: '' as Address,
                    name: '',
                },
                amount: {
                    amount: '' as GweiBalance,
                    token: false as (false | Balance)
                },
                fee: {
                    amount: '' as GweiBalance,
                    token: this.feeToken as (false | Balance)
                },
            }
        },
        setTransactionInfo: function(transaction: Transaction, continueAfter =false) {
            this.transactionInfo.continueBtnFunction = continueAfter;
            this.transactionInfo.hash = transaction.txHash;
            this.transactionInfo.explorerLink = APP_ZKSYNC_BLOCK_EXPLORER+'/transactions/'+transaction.txHash;
            this.transactionInfo.fee.token = this.feeToken;
            this.transactionInfo.fee.amount = transaction.txData.tx.fee;
            this.transactionInfo.amount = undefined;
            this.transactionInfo.recepient = undefined;
            this.transactionInfo.type = 'ActivateAccount';
        },
        successBlockContinue: function() {
            this.clearTransactionInfo();
            this.choosedToken=false;
            this.choosedFeeToken=false;
        }
    },
    async mounted() {
        try {
            this.loading=true;
            if (this.$route.query["w"]) {
                this.inputedAddress = this.$route.query["w"].toString();
            }
            if (this.$route.query["token"]) {
                const balances = this.$store.getters['wallet/getzkBalances'] as Array<Balance>;
                for(const item of balances) {
                    if(item.symbol===this.$route.query["token"]) {
                        this.chooseToken(item);
                        break;
                    }
                }
            }
            zksync = await walletData.zkSync();
            if(this.type==='withdraw') {
                await this.getWithdrawalTime();
            }
            if(!this.ownAccountUnlocked) {
                await this.getAccountActivationFee();
            }
            this.loading=false;
        } catch (error) {
            console.log(error);
            this.loading=false;
        }
    },
});
</script>