import { BigNumber, BigNumberish, ContractTransaction } from "ethers";
import { Route } from "vue-router/types";
import { Provider } from "zksync/build";
import {
  AccountState,
  Address,
  ChangePubKeyCREATE2,
  ChangePubKeyECDSA,
  ChangePubKeyOnchain,
  PubKeyHash,
  SignedTransaction,
  TokenSymbol,
  TransactionReceipt,
} from "zksync/build/types";
import { ETHOperation, Transaction, Wallet, ZKSyncTxError } from "zksync/build/wallet";
import { accessorType } from "~/store";

export declare type ZKTypeFeeOption = "fast" | "normal";
export declare type ZKTypeTransactionType = "withdraw" | "transfer" | "deposit";
export declare type ZKTypeDisplayToken = {
  symbol: TokenSymbol;
  rawBalance?: BigNumber;
  status?: string;
  pendingBalance?: BigNumber;
};

export declare type ZKDisplayToken = {
  symbol: string;
  rawBalance: BigNumber | undefined;
  status: string | undefined;
};

export declare type VueRefs = Vue & { validate: () => boolean };

export declare type ZKTypeDisplayBalances = {
  [symbol: string]: ZKTypeDisplayToken;
};

export declare type GweiBalance = string | BigNumberish;
export declare type DecimalBalance = string;

export declare interface ZkInTokenPrices {
  [token: string]: {
    lastUpdated: number;
    price: number;
  };
}

export interface BalanceToReturn {
  address: string;
  balance: string;
  symbol: string;
  id: number;
}

export interface ZkInBalance {
  id: number;
  symbol: TokenSymbol;
  status: "Pending" | "Verified";
  balance: GweiBalance;
  rawBalance: BigNumber;
  verifiedBalance: GweiBalance;
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
    address: Address;
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
  rawBalance: BigNumber;
  verifiedBalance: GweiBalance;
  restricted: boolean;
  unlocked?: boolean;
  address?: string;
}

//
// export declare interface ZkInTransactionInfo {
//  continueBtnFunction: boolean;
//  amount: GweiBalance;
//  success: boolean;
//  fee: { amount: GweiBalance; token: false | ZkInBalance };
//  recipient?: Address;
//  continueBtnText?: string;
//  type: string;
//  hash: string;
//  explorerLink: string;
// }

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
}

export declare interface iWalletWrapper {
  set: (val: iWalletData) => void;
  get: () => iWalletData;
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

export interface Balance {
  symbol: TokenSymbol;
  status: "Pending" | "Verified";
  balance: GweiBalance;
  rawBalance: BigNumber;
  verifiedBalance: GweiBalance;
  restricted: boolean;
  unlocked?: boolean;
  address?: string;
}

export declare interface networkEthId {
  name: string;
  id: number;
}

export declare interface ZkInWithdrawParams {
  address: Address;
  token: TokenSymbol;
  feeToken: TokenSymbol;
  amount: GweiBalance;
  fastWithdraw: boolean;
  fees: GweiBalance;
  store: typeof accessorType;
}

export declare interface ZkInSyncTransfer {
  to: Address;
  token: TokenSymbol;
  amount: GweiBalance;
  fee: GweiBalance;
}

export declare interface ZkInWatchArgs {
  depositResponse: ETHOperation;
  token: TokenSymbol;
  amount: GweiBalance;
}

export interface DepositsInterface {
  [tokenSymbol: string]: {
    hash: string;
    amount: string;
    status: string;
    confirmations: number;
  }[];
}

/**
 * Redeclared since we use TokenInfo which is a part of this interface
 */
export interface Tokens {
  // Tokens are indexed by their symbol (e.g. "ETH")
  [token: string]: TokenInfo;
}

export interface CPKLocal {
  accountId: number;
  account: Address;
  newPkHash: PubKeyHash;
  nonce: number;
  ethAuthData?: ChangePubKeyOnchain | ChangePubKeyECDSA | ChangePubKeyCREATE2;
  ethSignature?: string;
  validFrom: number;
  validUntil: number;
}

export interface ReceivedTransactions {
  transaction: Transaction | null;
  feeTransaction: Transaction | null;
  cpkTransaction: null | Transaction;
}

export declare interface ZkInWithdrawalTime {
  normal: number;
  fast: number;
}

export declare interface ZkIContracts {
  contactsList: ZkInContact[];
  storageKey?: string;
}

export declare interface ZkIAccount {
  loggedIn: boolean;
  selectedWallet?: string;
  loadingHint?: string;
  address?: Address;
  name?: string;
  errorsSpotted: boolean;
}

export interface ZkIFeesInterface {
  [symbol: string]: {
    [feeSymbol: string]: {
      [type: string]: {
        [address: string]: {
          lastUpdated: number;
          value: ZkInFeesObj;
        };
      };
    };
  };
}

export interface ZKIRootState {
  accountModalOpened: boolean;
  currentModal?: string;
  previousRoute?: Route;
}

export type BalancesList = {
  [token: string]: BigNumber;
};

export interface ZKITransactionsStore {
  watchedTransactions: {
    [txHash: string]: {
      [prop: string]: string;
      status: string;
    };
  };
  deposits: ZkInDeposits;
  forceUpdateTick: number;
  withdrawalTxToEthTx: Map<string, string>;
}

export interface ZKIDepositStatus {
  tokenSymbol: TokenSymbol;
  hash: string;
  amount: GweiBalance;
  status: string;
  confirmations: number;
}
