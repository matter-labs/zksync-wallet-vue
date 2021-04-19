import { WalletModuleState } from "@/store/wallet";
import {
  Initialization,
  PopupContent,
  Subscriptions,
  WalletInitOptions,
  WalletModule,
  WalletSelectModuleOptions,
  Wallet as OnBoardingWallet,
} from "@matterlabs/zk-wallet-onboarding/dist/src/interfaces";
import { Store } from "vuex";
import Web3 from "web3";
import web3Wallet from "@/plugins/web3";
import { ETHER_NETWORK_ID, ETHER_NETWORK_NAME } from "@/plugins/build";

const APP_NAME = "zkSync Beta";
const FORCED_EXIT_LINK = `https://withdraw${ETHER_NETWORK_NAME === "mainnet" ? ".zksync.io" : "-" + ETHER_NETWORK_NAME + ".zksync.dev"}`;
const FORTMATIC_KEY = process.env.APP_FORTMATIC;
const INFURA_KEY: string | undefined = process.env.APP_WALLET_CONNECT;
const RPC_URL = `https://${ETHER_NETWORK_NAME}.infura.io/v3/${process.env.APP_WS_API_ETHERSCAN_TOKEN}`;
const initializedWallets: WalletSelectModuleOptions = {
  wallets: <Array<WalletModule | WalletInitOptions>>[
    { walletName: "imToken", rpcUrl: RPC_URL, preferred: true },
    { walletName: "metamask", preferred: true },
    {
      walletName: "walletConnect",
      networkId: ETHER_NETWORK_ID,
      infuraKey: INFURA_KEY,
      enableLogging: true,
      preferred: true,
    },
    // FIXME: enable again
    // { walletName: "authereum" },
    { walletName: "coinbase", preferred: true },
    { walletName: "trust", preferred: true, rpcUrl: RPC_URL },
    { walletName: "dapper", preferred: false },
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
    {
      walletName: "portis",
      apiKey: process.env.APP_PORTIS,
      preferred: true,
      label: "Portis",
    },
    { walletName: "opera" },
    { walletName: "operaTouch" },
    { walletName: "torus" },
    { walletName: "status" },
    { walletName: "meetone" },
    { walletName: "mykey", rpcUrl: RPC_URL },
    { walletName: "huobiwallet", rpcUrl: RPC_URL },
    { walletName: "hyperpay" },
    { walletName: "wallet.io", rpcUrl: RPC_URL },
    { walletName: "atoken" },
  ],
};
export default (ctx: Store<WalletModuleState>): Initialization => {
  const colorTheme: string | null = localStorage.getItem("colorTheme");
  return <Initialization>{
    hideBranding: true,
    blockPollingInterval: 400000,
    dappId: process.env.APP_ONBOARDING_APP_ID, // [String] The API key created by step one above
    networkId: ETHER_NETWORK_ID, // [Integer] The Ethereum network ID your Dapp uses.
    darkMode: colorTheme !== null && colorTheme === "dark",
    subscriptions: <Subscriptions>{
      wallet: (wallet: OnBoardingWallet) => {
        if (wallet && wallet.provider) {
          wallet.provider.autoRefreshOnNetworkChange = false;
        }
        // @ts-ignore
        web3Wallet.set(new Web3(wallet.provider));
        if (process.client) {
          ctx.commit("account/setSelectedWallet", wallet.name, { root: true });
          window.localStorage.setItem("selectedWallet", wallet.name as string);
        }
        // eslint-disable-next-line no-unused-expressions
        wallet.provider;
      },
    },
    walletSelect: <WalletSelectModuleOptions>{
      wallets: <Array<WalletModule | WalletInitOptions>>initializedWallets.wallets,
    },
    popupContent: <PopupContent>{
      dismiss: "Dismiss",
      teaser: "Can't find your wallet?",
      fullHtml: `If you have funds on zkSync on an account that you can't control (a smart contract or an exchange deposit account) it is possible to use the <a href="${FORCED_EXIT_LINK}" target="_blank">Alternative Withdrawal</a> to move the funds to Layer 1 without interacting with Layer 2.`,
    },
  };
};
