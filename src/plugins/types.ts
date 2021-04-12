import { BigNumber } from "ethers";
import { Wallet } from "zksync/build";
import { AccountState, TokenSymbol } from "zksync/build/types";
import { Provider } from "zksync/build/provider";

import * as zkSyncType from "zksync";

export declare type Address = string;
export declare type PubKeyHash = string;
export declare type TokenAddress = string;
export declare type TokenLike = TokenSymbol | TokenAddress;
export declare type GweiBalance = string;
export declare type DecimalBalance = string;
export declare type Nonce = number | "committed";
export declare type NetworkIDS = {
  [key: string]: number;
};

export declare type zksync = typeof zkSyncType;

export interface Signature {
  pubKey: string;
  signature: string;
}
export interface Contact {
  address: Address;
  name: string;
  deleted?: boolean;
  notInContacts?: boolean;
}

export interface FeesObj {
  normal?: GweiBalance | BigNumber;
  fast?: GweiBalance | BigNumber;
}

export interface CloseAccount {
  type: "Close";
  account: Address;
  nonce: number;
  signature: Signature;
}

export interface BlockInfo {
  blockNumber: number;
  committed: boolean;
  verified: boolean;
}

export interface TransactionReceipt {
  executed: boolean;
  success?: boolean;
  failReason?: string;
  block?: BlockInfo;
}

export interface PriorityOperationReceipt {
  executed: boolean;
  block?: BlockInfo;
}

export interface ContractAddress {
  mainContract: string;
  govContract: string;
}

export interface TokenItem {
  address: string;
  id: number;
  symbol: string;
  decimals: number;
}
export interface Tokens {
  [token: string]: TokenItem;
}

export interface TokenPrices {
  [token: string]: {
    lastUpdated: number;
    price: number;
  };
}

export declare interface singleIcon {
  name: string;
  img: string;
  url: string;
  hideIn?: string;
}

export interface iWalletData {
  syncProvider?: typeof Provider;
  syncWallet?: Wallet;
  accountState?: AccountState;
  zkSync?: zksync;
}

export declare interface depositTx {
  hash: string;
  amount: BigNumber | string;
  status: string;
  confirmations: number;
}

export declare interface DepositsInterface {
  [tokenSymbol: string]: Array<depositTx>;
}

export declare interface iWalletWrapper {
  set: (val: iWalletData) => void;
  zkSync: () => Promise<zksync | undefined>;
  get: () => iWalletData;
}
