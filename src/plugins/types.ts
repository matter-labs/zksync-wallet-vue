import { BigNumber } from "ethers";
import { TransactionReceipt } from "zksync/build/types";
import { Wallet } from "zksync/src";
import { AccountState, Address, TokenSymbol } from "zksync/src/types";
import { Provider } from "zksync/build/provider";

import * as zkSyncType from "zksync";
export declare type zksync = typeof zkSyncType;

export declare type GweiBalance = string;
export declare type DecimalBalance = string;

export declare interface ZkInEthNetwork {
  rinkeby: number;
  mainnet: number;
  ropsten: number;
}

export declare interface ZkInTokenPrices {
  [token: string]: {
    lastUpdated: number;
    price: number;
  };
}

export interface ZkInTx {
  hash: string;
  pq_id?: any;
  eth_block: number;
  tx: {
    fast: boolean;
    amount: string;
    fee: string;
    from: string;
    nonce: number;
    priority_op?: {
      amount: string;
      from: string;
      to: string;
      token: string;
    };
    signature: {
      pubKey: string;
      signature: string;
    };
    to?: string;
    token?: string;
    feeToken?: number;
    type: "Transfer" | "Withdraw" | "Deposit" | "ChangePubKey";
  };

  success: boolean;
  fail_reason?: any;
  commited: boolean;
  verified: boolean;
  confirmCount: number;
  created_at: Date;
}

export declare interface ZkInTransactionInfo {
  continueBtnFunction: boolean;
  amount: any;
  success: boolean;
  fee: { amount: string; token: false | Balance };
  recipient?: any;
  continueBtnText?: string;
  type: string;
  hash: string;
  explorerLink: string;
}

export interface ZkInBalance {
  symbol: TokenSymbol;
  status: "Pending" | "Verified";
  balance: GweiBalance;
  rawBalance: BigNumber;
  verifiedBalance: GweiBalance;
  tokenPrice: number;
  restricted: boolean;
  unlocked?: boolean;
  address?: string;
}

export interface ZkInContact {
  address: Address;
  name: string;
  deleted?: boolean;
  notInContacts?: boolean;
}

export interface ZkInFeesObj {
  normal?: GweiBalance | BigNumber;
  fast?: GweiBalance | BigNumber;
}

export interface ZkInContractAddress {
  mainContract: string;
  govContract: string;
}

export interface ZkInTokenItem {
  address: string;
  id: number;
  symbol: string;
  decimals: number;
}

export interface TokenPrices {
  [token: TokenSymbol]: {
    lastUpdated: number;
    price: number;
  };
}

export interface TxEthSignature {
  type: "EthereumSignature" | "EIP1271Signature";
  signature: string;
}

export interface Fee {
  feeType: "Withdraw" | "Transfer" | "TransferToNew" | "FastWithdraw" | ChangePubKeyFee | LegacyChangePubKeyFee;
  gasTxAmount: BigNumber;
  gasPriceWei: BigNumber;
  gasFee: BigNumber;
  zkpFee: BigNumber;
  totalFee: BigNumber;
}

export declare class Transaction {
  txData: any;
  txHash: string;
  sidechainProvider: Provider;
  state: "Sent" | "Committed" | "Verified" | "Failed";
  error?: ZKSyncTxError;
  constructor(txData: any, txHash: string, sidechainProvider: Provider);
  awaitReceipt(): Promise<TransactionReceipt>;
  awaitVerifyReceipt(): Promise<zkInTransactionInfo>;
  private setErrorState;
}

export declare interface singleIcon {
  name: string;
  img: string;
  url: string;
  hideIn?: string;
}

export interface iWalletData {
  syncProvider?: Provider;
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
