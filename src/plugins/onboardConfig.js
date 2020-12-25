import Web3 from "web3";
import web3Wallet from "@/plugins/web3.js";
const APP_NAME = process.env.APP_NAME;
const FORTMATIC_KEY = process.env.APP_FORTMATIC;
const INFURA_KEY = process.env.APP_WALLET_CONNECT;
const RPC_URL = `https://${process.env.APP_CURRENT_NETWORK}.infura.io/v3/${process.env.APP_WS_API_ETHERSCAN_TOKEN}`;
const initializedWallets = {
  wallets: [
    { walletName: "metamask", preferred: true },
    {
      walletName: "walletConnect",
      infuraKey: INFURA_KEY,
      preferred: true,
    },
    { walletName: "coinbase", preferred: true },
    { walletName: "trust", preferred: true, rpcUrl: RPC_URL },
    { walletName: "dapper", preferred: true },
    {
      walletName: "ledger",
      rpcUrl: RPC_URL,
    },
    {
      walletName: "lattice",
      rpcUrl: RPC_URL,
      appName: APP_NAME,
    },
    {
      walletName: "fortmatic",
      apiKey: FORTMATIC_KEY,
      preferred: true,
    },
    { walletName: "authereum" },
    { walletName: "opera" },
    { walletName: "operaTouch" },
    { walletName: "torus" },
    { walletName: "status" },
    { walletName: "unilogin" },
    { walletName: "imToken", rpcUrl: RPC_URL },
    { walletName: "meetone" },
    { walletName: "mykey", rpcUrl: RPC_URL },
    { walletName: "huobiwallet", rpcUrl: RPC_URL },
    { walletName: "hyperpay" },
    { walletName: "wallet.io", rpcUrl: RPC_URL },
    { walletName: "atoken" },
  ],
};
export default () => {
  return {
    dappId: process.env.APP_ONBOARDING_APP_ID, // [String] The API key created by step one above
    networkId: parseInt(process.env.APP_CURRENT_NETWORK_ID), // [Integer] The Ethereum network ID your Dapp uses.
    darkMode: true,
    subscriptions: {
      wallet: (wallet) => {
        web3Wallet.set(new Web3(wallet.provider));
        if (process.client) {
          window.localStorage.setItem("selectedWallet", wallet.name);
        }
      },
    },
    walletSelect: {
      wallets: initializedWallets.wallets,
    },
  };
};
