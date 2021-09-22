import { Route } from "vue-router/types";
/* import { WeiBalance } from "matter-dapp-ui/types"; */
import { TokenSymbol } from "zksync/build/types";
import { BigNumberish } from "ethers";

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

export declare interface NetworkEthId {
  name: string;
  id: number;
}
