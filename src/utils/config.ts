import { version as zkSyncVersion } from "zksync/package.json";
import { version as walletVersion } from "../../package.json";

export const GIT_REVISION: string = process.env.APP_GIT_REVISION ? process.env.APP_GIT_REVISION.toString() : "";
export const GIT_REVISION_SHORT: string = GIT_REVISION.length > 8 ? GIT_REVISION.slice(0, 7) : GIT_REVISION;
export const VERSION: string = walletVersion;
export const ZK_LIB_VERSION: string = zkSyncVersion as string;

export const rampConfig = {
  mainnet: {
    url: undefined, // default
    hostApiKey: process.env.RAMP_MAINNET_HOST_API_KEY,
  },
  // rinkeby: {
  //  url: "https://ri-widget-staging.firebaseapp.com/",
  //  hostApiKey: process.env.RAMP_RINKEBY_HOST_API_KEY,
  // },
  // ropsten: {
  //   url: "https://ri-widget-staging-ropsten.firebaseapp.com/",
  //   hostApiKey: process.env.RAMP_ROPSTEN_HOST_API_KEY,
  // },
};

export const banxaConfig = {
  mainnet: {
    url: "https://zksync.banxa.com",
  },
  // rinkeby: {
  //   url: "https://zksync.banxa-sandbox.com",
  // },
  // ropsten: {
  //   url: "https://zksync.banxa-sandbox.com",
  // },
};

export const moonpayConfig = {
  mainnet: {
    url: "https://buy.moonpay.com",
    apiPublicKey: process.env.MOONPAY_MAINNET_API_PUBLIC_KEY,
  },
  rinkeby: {
    url: "https://buy-sandbox.moonpay.com",
    apiPublicKey: process.env.MOONPAY_RINKEBY_API_PUBLIC_KEY,
  },
  // ropsten: {
  //   url: "https://buy-staging.moonpay.com",
  //   apiPublicKey: process.env.MOONPAY_API_PUBLIC_KEY,
  // },
};
