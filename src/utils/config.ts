import { version as zkSyncVersion } from "zksync/package.json";
import { version as walletVersion } from "../../package.json";

export const GIT_REVISION: string = process.env.APP_GIT_REVISION ? process.env.APP_GIT_REVISION.toString() : "";
export const GIT_REVISION_SHORT: string = GIT_REVISION ? GIT_REVISION.slice(-7) : "";
export const VERSION: string = walletVersion;
export const ZK_LIB_VERSION: string = zkSyncVersion as string;

export const rampConfig = {
  mainnet: {
    url: undefined, // default
    hostApiKey: "pcrtzve8ax7vjamoct77ombequtqhuxbc8wdknwg",
  },
  rinkeby: {
    url: "https://ri-widget-staging.firebaseapp.com/",
    hostApiKey: "j3b3oszn2vsr4qkz4att67zrucm6m6yjpfvxvtyy",
  },
  ropsten: {
    url: "https://ri-widget-staging-ropsten.firebaseapp.com/",
    hostApiKey: "",
  },
};
