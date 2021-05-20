import { WalletModuleState } from "@/store/wallet";
import web3Wallet from "@/plugins/web3";
import { Initialization, Subscriptions, Wallet as OnBoardingWallet, WalletInitOptions, WalletModule, WalletSelectModuleOptions } from "bnc-onboard/dist/src/interfaces";
import { Store } from "vuex";
import Web3 from "web3";
import {
  ONBOARD_RPC_URL,
  ONBOARD_FORCED_EXIT_LINK,
  CURRENT_APP_NAME,
  ethWindow,
  ONBOARD_FORTMATIC_KEY,
  ONBOARD_PORTIS_KEY,
  ETHER_NETWORK_NAME,
  ONBOARD_INFURA_KEY,
  ETHER_NETWORK_ID,
} from "~/plugins/build";

const initializedWallets: WalletSelectModuleOptions = {
  wallets: <WalletModule[] | WalletInitOptions[]>[
    { walletName: "imToken", rpcUrl: ONBOARD_RPC_URL, preferred: true },
    {
      walletName: "walletConnect",
      networkId: ETHER_NETWORK_ID,
      infuraKey: ONBOARD_INFURA_KEY,
      enableLogging: true,
      preferred: true,
    },
    { walletName: "authereum" },
    { walletName: "coinbase", preferred: true },
    { walletName: "trust", preferred: true, rpcUrl: ONBOARD_RPC_URL },
    {
      walletName: "ledger",
      rpcUrl: ONBOARD_RPC_URL,
    },
    {
      walletName: "lattice",
      rpcUrl: ONBOARD_RPC_URL,
      appName: CURRENT_APP_NAME,
    },
    {
      walletName: "fortmatic",
      apiKey: ONBOARD_FORTMATIC_KEY,
      preferred: true,
    },
    {
      walletName: "portis",
      apiKey: ONBOARD_PORTIS_KEY,
      preferred: true,
      label: "Portis",
    },
    { walletName: "opera" },
    { walletName: "operaTouch" },
    { walletName: "torus" },
    { walletName: "status" },
    { walletName: "meetone" },
    { walletName: "mykey", rpcUrl: ONBOARD_RPC_URL },
    { walletName: "huobiwallet", rpcUrl: ONBOARD_RPC_URL },
    { walletName: "hyperpay" },
    { walletName: "wallet.io", rpcUrl: ONBOARD_RPC_URL },
    { walletName: "atoken" },
  ],
};

if (ethWindow?.ethereum) {
  initializedWallets.wallets?.unshift({ walletName: "metamask", preferred: true });
}

export default (ctx: Store<WalletModuleState>): Initialization => {
  const colorTheme: string | null = localStorage.getItem("colorTheme");
  return <Initialization>{
    hideBranding: true,
    blockPollingInterval: 400000,
    dappId: process.env.APP_ONBOARDING_APP_ID, // [String] The API key created by step one above
    networkId: ETHER_NETWORK_ID, // [Integer] The Ethereum network ID your Dapp uses.
    darkMode: colorTheme !== null && colorTheme === "dark",
    subscriptions: <Subscriptions>{
      wallet(wallet: OnBoardingWallet): void {
        const web3LoggedIn: Web3 = new Web3(wallet.provider);
        web3Wallet.set(web3LoggedIn);
        if (process.client) {
          ctx.commit("account/setSelectedWallet", wallet.name, { root: true });
          window.localStorage.setItem("selectedWallet", wallet.name as string);
        }
      },
      network: (networkId: number): void => {
        if (networkId !== ETHER_NETWORK_ID) {
          ctx.app.$accessor.wallet.errorDuringLogin({ force: <boolean>true, message: <string>`You're using wrong network. Change in to the ${ETHER_NETWORK_NAME}` });
        }
      },
    },
    walletSelect: <WalletSelectModuleOptions>{
      description: "Can't find your wallet?",
      explanation: `If you have funds on zkSync on an account that you can't control (a smart contract or an exchange deposit account) it is possible to use the <a href="${ONBOARD_FORCED_EXIT_LINK}" target="_blank">Alternative Withdrawal</a> to move the funds to Layer 1 without interacting with Layer 2.`,
      heading: "Can't find your wallet?",
      wallets: <Array<WalletModule | WalletInitOptions>>initializedWallets.wallets,
    },
    networkName: ETHER_NETWORK_NAME,
  };
};
