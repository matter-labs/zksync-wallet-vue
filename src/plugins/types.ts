import { BigNumber, BigNumberish } from "ethers";
import { AccountState, Address, TokenSymbol } from "zksync/build/types";
import { Wallet } from "zksync";

import { Provider } from "zksync/build/provider";

export declare type ZkTpNetworkName = "rinkeby" | "mainnet" | "ropsten";

export declare type ZkInTransactionType = "withdraw" | "transfer" | "deposit";

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

export interface ZkInBalance {
  id: number;
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

export declare interface ZkInTransactionInfo {
  continueBtnFunction: boolean;
  amount?: {
    amount: BigNumberish;
    token: false | ZkInBalance;
  };
  fee?: {
    amount: BigNumberish;
    token: false | ZkInBalance;
  };
  recipient?: {
    address: string;
    name: string;
  };
  success: boolean;
  continueBtnText?: string;
  type: string;
  hash: string;
  explorerLink: string;
}

export interface ZkInTx {
  tx_id: string; // Unique identifier of a transaction, designated to be used in relative tx history queries.
  hash: string; // Hash of a transaction.
  eth_block?: number; // Number of Ethereum block in which priority operation was added. `null` for transactions.
  pq_id?: number; // Identifier of a priority operation. `null` for transactions.
  success?: boolean; // Flag for successful transaction execution. `null` for priority operations.
  fail_reason?: string; // Reason of the transaction failure. May be `null`.
  commited: boolean; // Flag for inclusion of transaction into some block.
  verified: boolean; // Flag of having the block with transaction verified.
  created_at: string; // Timestamp of the transaction execution.
  confirmCount: number;
  tx: {
    // Transaction / Priority operation contents. Structure depends on the type of operation.
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
}
export interface TokenInfo {
  address: string;
  id: number;
  symbol: string;
  decimals: number;
}
export interface ZkInToken {
  id: number;
  symbol: TokenSymbol;
  balance: GweiBalance;
  address: string;
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
}

export declare interface ZKInDepositTx {
  hash: string;
  amount: BigNumber | string;
  status: string;
  confirmations: number;
}

export declare interface ZkInDeposits {
  [tokenSymbol: string]: ZKInDepositTx[];
}

export declare interface iWalletWrapper {
  set: (val: iWalletData) => void;
  get: () => iWalletData;
}
