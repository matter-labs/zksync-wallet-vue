import Web3 from 'web3';
import web3Wallet from '@/plugins/web3.js';

export default (store) => {
    return {
        dappId: process.env.APP_ONBOARDING_APP_ID,             // [String] The API key created by step one above
        networkId: parseInt(process.env.APP_CURRENT_NETWORK_ID),         // [Integer] The Ethereum network ID your Dapp uses.
        subscriptions: {
            wallet: (wallet) => {
                web3Wallet.set(new Web3(wallet.provider));
                window.localStorage.setItem('selectedWallet', wallet.name);
            }
        }
    }
}