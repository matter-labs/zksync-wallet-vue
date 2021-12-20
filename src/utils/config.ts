import { version as zkSyncVersion } from "zksync/package.json";
import { version as walletVersion } from "../../package.json";

export const GIT_REVISION: string = process.env.APP_GIT_REVISION ? process.env.APP_GIT_REVISION.toString() : "";
export const GIT_REVISION_SHORT: string = GIT_REVISION ? GIT_REVISION.slice(-7) : "";
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
