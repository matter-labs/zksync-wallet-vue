import { BigNumberish } from "ethers";
import { Route } from "vue-router/types";

export interface ZkFeeState {
  withdrawFees: {
    [symbol: string]: BigNumberish;
  };
  withdrawFeesLoading: {
    [symbol: string]: boolean;
  };
}

export interface ZKIRootState {
  accountModalOpened: boolean;
  currentModal?: string;
  previousRoute?: Route;
}

export declare interface SingleIcon {
  name: string;
  img: string;
  url: string;
  hideIn?: string;
}
