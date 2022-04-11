import { Route } from "vue-router/types";

export interface ZKIRootState {
  accountModalOpened: boolean;
  currentModal?: string;
  previousRoute?: Route;
}

export interface NFTItem {
  cid: string;
  exists: boolean;
  name?: string;
  description?: string;
  image?: string;
}

export interface ZkNFTState {
  nfts: {
    [cid: string]: undefined | NFTItem;
  };
  nftsLoading: {
    [cid: string]: boolean;
  };
}

export declare interface SingleIcon {
  name: string;
  icon: string;
  url: string;
  hideIn?: string;
}

export declare type Location = "header" | "footer";

export declare type ProvidersRampCfg = { url?: string; hostApiKey?: string } | undefined;
export declare type ProvidersUtorgCfg = { url?: string; sid?: string } | undefined;
export declare type ProvidersBanxaCfg = { url: string } | undefined;
export declare type ProvidersMoonpayCfg = { url?: string; apiPublicKey?: string } | undefined;
