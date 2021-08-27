import { CURRENT_APP_NAME, ETHER_NETWORK_ID, ETHER_NETWORK_NAME, ONBOARD_FORCED_EXIT_LINK, ONBOARD_FORTMATIC_KEY, ONBOARD_PORTIS_KEY, ONBOARD_RPC_URL, rpc } from "@/plugins/build";

import {
  AllWalletInitOptions,
  CommonWalletOptions,
  Initialization,
  WalletCheckInit,
  WalletCheckModule,
  WalletInitOptions,
  WalletSelectModuleOptions,
} from "bnc-onboard/dist/src/interfaces";

const wallets: WalletInitOptions[] | CommonWalletOptions[] | AllWalletInitOptions[] = [
  { walletName: "imToken", rpcUrl: ONBOARD_RPC_URL, preferred: true },
  { walletName: "metamask", preferred: true },
  {
    walletName: "walletConnect",
    rpc,
    bridge: "https://bridge.walletconnect.org/",
    networkId: ETHER_NETWORK_ID,
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
  { walletName: "tokenpocket", rpcUrl: ONBOARD_RPC_URL },
];

const colorTheme: string | null = localStorage.getItem("colorTheme");

const onboardConfig: Initialization = {
  hideBranding: true,
  blockPollingInterval: 40000,
  dappId: process.env.APP_ONBOARDING_APP_ID, // [String] The API key created by step one above
  networkId: ETHER_NETWORK_ID as number, // [Integer] The Ethereum network ID your Dapp uses.
  networkName: ETHER_NETWORK_NAME,
  darkMode: colorTheme !== null && colorTheme === "dark",
  walletCheck: <(WalletCheckModule | WalletCheckInit)[]>[{ checkName: "derivationPath" }, { checkName: "connect" }, { checkName: "accounts" }, { checkName: "network" }],
  walletSelect: <WalletSelectModuleOptions>{
    wallets,
    description: "",
    explanation: `If you have funds on zkSync on an account that you can't control (a smart contract or an exchange deposit account) it is possible to use the <a href="${ONBOARD_FORCED_EXIT_LINK}" target="_blank">Alternative Withdrawal</a> to move the funds to Layer 1 without interacting with Layer 2.`,
  },
};

export default onboardConfig;
