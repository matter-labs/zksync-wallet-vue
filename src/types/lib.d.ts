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
  image?: `https://${string}`;
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
  img: string;
  url: string;
  hideIn?: string;
}
