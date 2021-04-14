import { BigNumber, ContractTransaction } from "ethers";
import { ETHOperation, ZKSyncTxError } from "zksync/build/wallet";
import { SignedTransaction, TransactionReceipt, AccountState, Address, TokenSymbol } from "zksync/src/types";
import { Wallet, Provider } from "zksync";

export declare type GweiBalance = string;
export declare type DecimalBalance = string;

export declare interface ZkInTokenPrices {
  [token: string]: {
    lastUpdated: number;
    price: number;
  };
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

  confirmCount: number;
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

export declare interface ZkInTransactionInfo {
  continueBtnFunction: boolean;
  amount: GweiBalance;
  success: boolean;
  fee: { amount: GweiBalance; token: false | ZkInBalance };
  recipient?: Address;
  continueBtnText?: string;
  type: string;
  hash: string;
  explorerLink: string;
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
  [token: string]: {
    lastUpdated: number;
    price: number;
  };
}

export declare class ZkClTransaction extends ETHOperation {
  txData: SignedTransaction;
  txHash: string;
  sidechainProvider: Provider;
  state: "Sent" | "Committed" | "Verified" | "Failed";
  error?: ZKSyncTxError;
  constructor(txData: ContractTransaction, txHash: string, sidechainProvider: Provider);
  awaitReceipt(): Promise<TransactionReceipt>;
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
  zkSync?: unknown;
}

export declare interface ZKInDepositTx extends ETHOperation {
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
  zkSync: () => Promise<unknown>;
  get: () => iWalletData;
  setProvider: (importedProvider: Provider) => void;
}

export interface Balance {
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

export declare interface networkEthId {
  name: string;
  id: number;
}
