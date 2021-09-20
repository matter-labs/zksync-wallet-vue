import {
  CURRENT_APP_NAME,
  ETHER_NETWORK_ID,
  ONBOARD_APP_EMAIL,
  ONBOARD_APP_LOGO,
  ONBOARD_APP_NAME,
  ONBOARD_APP_URL,
  ONBOARD_FORCED_EXIT_LINK,
  ONBOARD_FORTMATIC_KEY,
  ONBOARD_PORTIS_KEY,
  ONBOARD_RPC_URL,
} from "@/plugins/build";

import {
  AllWalletInitOptions,
  AuthereumOptions,
  CommonWalletOptions,
  LedgerOptions,
  Initialization,
  TrezorOptions,
  WalletCheckInit,
  WalletCheckModule,
  WalletInitOptions,
  WalletSelectModuleOptions,
} from "bnc-onboard/dist/src/interfaces";

const basicWallet = {
  appName: ONBOARD_APP_NAME,
  appLogoUrl: ONBOARD_APP_LOGO,
  appUrl: ONBOARD_APP_URL,
  networkId: ETHER_NETWORK_ID,
  rpcUrl: ONBOARD_RPC_URL,
};

const wallets: WalletInitOptions[] | CommonWalletOptions[] | AllWalletInitOptions[] = [
  { ...basicWallet, walletName: "detectedwallet", preferred: true },
  { ...basicWallet, walletName: "metamask", preferred: true },
  { ...basicWallet, walletName: "imToken", rpcUrl: ONBOARD_RPC_URL, preferred: true },
  {
    ...basicWallet,
    walletName: "fortmatic",
    apiKey: ONBOARD_FORTMATIC_KEY,
    preferred: true,
  },
  {
    ...basicWallet,
    walletName: "keystone",
  },
  {
    appUrl: ONBOARD_APP_URL,
    email: ONBOARD_APP_EMAIL,
    rpcUrl: ONBOARD_RPC_URL,
    preferred: true,
    walletName: "trezor",
  } as TrezorOptions,
  {
    ...basicWallet,
    walletName: "coinbase",
  },
  {
    networkId: ETHER_NETWORK_ID,
    rpcUrl: ONBOARD_RPC_URL,
    walletName: "ledger",
    preferred: true,
  } as LedgerOptions,
  {
    ...basicWallet,

    walletName: "lattice",
    rpcUrl: ONBOARD_RPC_URL,
    appName: CURRENT_APP_NAME,
    networkId: ETHER_NETWORK_ID,
  },
  {
    ...basicWallet,
    walletName: "portis",
    apiKey: ONBOARD_PORTIS_KEY,
    display: { desktop: true, mobile: false },
    label: "Portis",
  },
  { ...basicWallet, walletName: "atoken" },
  { ...basicWallet, walletName: "opera", display: { desktop: true, mobile: false } },
  { ...basicWallet, walletName: "operaTouch", display: { desktop: false, mobile: true } },
  { ...basicWallet, walletName: "torus", display: { desktop: true, mobile: false } },
  { ...basicWallet, walletName: "status" },
  { ...basicWallet, walletName: "meetone" },
  { ...basicWallet, walletName: "trust" },
  { ...basicWallet, walletName: "wallet.io" },
  { ...basicWallet, walletName: "walletLink" },
  { ...basicWallet, walletName: "tp" },
  { ...basicWallet, walletName: "mykey" },
  { ...basicWallet, walletName: "huobiwallet" },
  { ...basicWallet, walletName: "hyperpay" },
  { ...basicWallet, walletName: "cobovault" },
  { ...basicWallet, walletName: "tokenpocket" },
  { ...basicWallet, walletName: "gnosis" },
  { ...basicWallet, walletName: "dcent" },
  { ...basicWallet, walletName: "xdefi" },
  { ...basicWallet, walletName: "liquality" },
];

const colorTheme: string | null = localStorage.getItem("colorTheme");

const walletChecks = [
  {
    checkName: "accounts",
  },
  {
    checkName: "derivationPath",
  },
  {
    checkName: "connect",
  },
  {
    checkName: "network",
  },
];

const onboardConfig: Initialization = {
  dappId: process.env.APP_ONBOARDING_APP_ID, // [String] The API key created by step one above
  networkId: ETHER_NETWORK_ID, // [Integer] The Ethereum network ID your Dapp uses.
  hideBranding: true,
  blockPollingInterval: 7500,
  darkMode: colorTheme !== null && colorTheme === "dark",
  walletCheck: walletChecks as (WalletCheckModule | WalletCheckInit)[],
  walletSelect: <WalletSelectModuleOptions>{
    wallets,
    description: "",
    explanation: `If you have funds on zkSync on an account that you can't control (a smart contract or an exchange deposit account) it is possible to use the <a href="${ONBOARD_FORCED_EXIT_LINK}" target="_blank">Alternative Withdrawal</a> to move the funds to Layer 1 without interacting with Layer 2.`,
  },
};

export default onboardConfig;
