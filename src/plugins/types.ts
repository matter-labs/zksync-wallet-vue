import { BigNumber, BigNumberish, ContractTransaction, ethers } from "ethers";
import { ChangePubKeyFee, LegacyChangePubKeyFee, SignedTransaction } from "zksync/build/types";

export declare type Address = string;
export declare type PubKeyHash = string;
export declare type TokenSymbol = string;
export declare type TokenAddress = string;
export declare type TokenLike = TokenSymbol | TokenAddress;
export declare type GweiBalance = string;
export declare type DecimalBalance = string;
export declare type Nonce = number | "committed";

export interface Signature {
  pubKey: string;
  signature: string;
}
export interface ForcedExit {
  type: "ForcedExit";
  initiatorAccountId: number;
  target: Address;
  token: number;
  fee: BigNumberish;
  nonce: number;
  signature: Signature;
}

export interface Transfer {
  type: "Transfer";
  accountId: number;
  from: Address;
  to: Address;
  token: number;
  amount: BigNumberish;
  fee: BigNumberish;
  nonce: number;
  signature: Signature;
  tx?: any;
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

export interface Token {
  id: number;
  address: Address;
  balance: string | BigNumber;
  symbol: TokenSymbol;
}
export interface zksync {
  closestPackableTransactionAmount(num: BigNumberish): GweiBalance;
}

export interface Contact {
  address: Address;
  name: string;
  deleted?: boolean;
  notInContacts?: boolean;
}

export interface FeesObj {
  normal?: GweiBalance;
  fast?: GweiBalance;
}

export interface Withdraw {
  type: "Withdraw";
  accountId: number;
  from: Address;
  to: Address;
  token: number;
  amount: BigNumberish;
  fee: BigNumberish;
  nonce: number;
  signature: Signature;
}

export interface ChangePubKey {
  type: "ChangePubKey";
  accountId: number;
  account: Address;
  newPkHash: PubKeyHash;
  feeToken: number;
  fee: BigNumberish;
  nonce: number;
  signature: Signature;
  ethSignature: string;
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

export declare type EthSignerType = {
  verificationMethod: "ECDSA" | "ERC-1271";
  isSignedMsgPrefixed: boolean;
};

export interface TxEthSignature {
  type: "EthereumSignature" | "EIP1271Signature";
  signature: string;
}

export interface Tx {
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

export declare class Signer {
  readonly privateKey: Uint8Array;
  private constructor();
  pubKeyHash(): PubKeyHash;
  signSyncTransfer(transfer: { accountId: number; from: Address; to: Address; tokenId: number; amount: BigNumberish; fee: BigNumberish; nonce: number }): Transfer;
  signSyncWithdraw(withdraw: { accountId: number; from: Address; ethAddress: string; tokenId: number; amount: BigNumberish; fee: BigNumberish; nonce: number }): Withdraw;
  signSyncForcedExit(forcedExit: { initiatorAccountId: number; target: Address; tokenId: number; fee: BigNumberish; nonce: number }): ForcedExit;
  signSyncChangePubKey(changePubKey: { accountId: number; account: Address; newPkHash: PubKeyHash; feeTokenId: number; fee: BigNumberish; nonce: number }): ChangePubKey;
  static fromPrivateKey(pk: Uint8Array): Signer;
  static fromSeed(seed: Uint8Array): Signer;
  static fromETHSignature(
    ethSigner: ethers.Signer,
  ): Promise<{
    signer: Signer;
    ethSignatureType: EthSignerType;
  }>;
}

export declare abstract class AbstractJSONRPCTransport {
  abstract request(method: string, params: any): Promise<any>;

  subscriptionsSupported(): boolean;

  subscribe(subMethod: string, subParams: any, unsubMethod: string, cb: (data: any) => void): Promise<Subscription>;

  abstract disconnect(): any;

  abstract ws: {
    isOpened: boolean;
    open(): Promise<any>;
  };
}

export declare class TokenSet {
  private tokensBySymbol;

  constructor(tokensBySymbol: Tokens);

  private resolveTokenObject;

  isTokenTransferAmountPackable(tokenLike: TokenLike, amount: string): boolean;

  isTokenTransactionFeePackable(tokenLike: TokenLike, amount: string): boolean;

  formatToken(tokenLike: TokenLike, amount: BigNumberish): string;

  parseToken(tokenLike: TokenLike, amount: string): BigNumber;

  resolveTokenDecimals(tokenLike: TokenLike): number;

  resolveTokenId(tokenLike: TokenLike): number;

  resolveTokenAddress(tokenLike: TokenLike): TokenAddress;

  resolveTokenSymbol(tokenLike: TokenLike): TokenSymbol;
}

export interface AccountState {
  address: Address;
  id?: number;
  depositing: {
    balances: {
      [token: string]: {
        amount: BigNumberish;
        expectedAcceptBlock: number;
      };
    };
  };
  committed: {
    balances: {
      [token: string]: BigNumberish;
    };
    nonce: number;
    pubKeyHash: PubKeyHash;
  };
  verified: {
    balances: {
      [token: string]: BigNumberish;
    };
    nonce: number;
    pubKeyHash: PubKeyHash;
  };
}

export interface Fee {
  feeType: "Withdraw" | "Transfer" | "TransferToNew" | "FastWithdraw" | ChangePubKeyFee | LegacyChangePubKeyFee;
  gasTxAmount: BigNumber;
  gasPriceWei: BigNumber;
  gasFee: BigNumber;
  zkpFee: BigNumber;
  totalFee: BigNumber;
}

export declare class Provider {
  transport: AbstractJSONRPCTransport;
  contractAddress: ContractAddress;
  tokenSet: TokenSet;
  pollIntervalMilliSecs: number;

  private constructor();

  static newWebsocketProvider(address: string): Promise<Provider>;

  static newHttpProvider(address?: string, pollIntervalMilliSecs?: number): Promise<Provider>;

  submitTx(tx: any, signature?: TxEthSignature, fastProcessing?: boolean): Promise<string>;

  submitTxsBatch(
    transactions: {
      tx: any;
      signature?: TxEthSignature;
    }[],
  ): Promise<string[]>;

  getContractAddress(): Promise<ContractAddress>;

  getTokens(): Promise<Tokens>;

  getState(address: Address): Promise<AccountState>;

  getTxReceipt(txHash: string): Promise<TransactionReceipt>;

  getPriorityOpStatus(serialId: number): Promise<PriorityOperationReceipt>;

  getConfirmationsForEthOpAmount(): Promise<number>;

  getEthTxForWithdrawal(withdrawal_hash: any): Promise<string>;
  notifyTransaction(hash: string, action: "COMMIT" | "VERIFY"): Promise<TransactionReceipt>;

  getTransactionFee(txType: "Withdraw" | "Transfer" | "FastWithdraw" | ChangePubKeyFee | LegacyChangePubKeyFee, address: Address, tokenLike: TokenLike): Promise<Fee>;

  getTransactionsBatchFee(txTypes: ("Withdraw" | "Transfer" | "FastWithdraw")[], addresses: Address[], tokenLike: TokenLike): Promise<BigNumber>;

  getTokenPrice(tokenLike: TokenLike): Promise<number>;

  disconnect(): Promise<any>;
}

declare class ZKSyncTxError extends Error {
  value: PriorityOperationReceipt | TransactionReceipt;

  constructor(message: string, value: PriorityOperationReceipt | TransactionReceipt);
}

export declare class Wallet {
  ethSigner: ethers.Signer;
  cachedAddress: Address;
  signer?: Signer;
  accountId?: number;
  ethSignerType?: EthSignerType;
  provider: Provider;
  private constructor();
  connect(provider: Provider): this;
  static fromEthSigner(ethWallet: ethers.Signer, provider: Provider, signer?: Signer, accountId?: number, ethSignerType?: EthSignerType): Promise<Wallet>;
  static fromEthSignerNoKeys(ethWallet: ethers.Signer, provider: Provider, accountId?: number, ethSignerType?: EthSignerType): Promise<Wallet>;
  getEthMessageSignature(message: string): Promise<TxEthSignature>;
  signSyncTransfer(transfer: { to: Address; token: TokenLike; amount: BigNumberish; fee: BigNumberish; nonce: number }): Promise<SignedTransaction>;
  signSyncForcedExit(forcedExit: { target: Address; token: TokenLike; fee: BigNumberish; nonce: number }): Promise<SignedTransaction>;
  syncForcedExit(forcedExit: { target: Address; token: TokenLike; fee?: BigNumberish; nonce?: Nonce }): Promise<Transaction>;
  syncMultiTransfer(
    transfers: {
      to: Address;
      token: TokenLike;
      amount: BigNumberish;
      fee: BigNumberish;
      nonce?: Nonce;
    }[],
  ): Promise<Transaction[]>;

  syncTransfer(transfer: { to: Address; token: TokenLike; amount: BigNumberish; fee?: BigNumberish; nonce?: Nonce }): Promise<Transaction>;
  signWithdrawFromSyncToEthereum(withdraw: { ethAddress: string; token: TokenLike; amount: BigNumberish; fee: BigNumberish; nonce: number }): Promise<SignedTransaction>;
  withdrawFromSyncToEthereum(withdraw: {
    ethAddress: string;
    token: TokenLike;
    amount: BigNumberish;
    fee?: BigNumberish;
    nonce?: Nonce;
    fastProcessing?: boolean;
  }): Promise<Transaction>;

  isSigningKeySet(): Promise<boolean>;
  signSetSigningKey(changePubKey: { feeToken: TokenLike; fee: BigNumberish; nonce: number; onchainAuth: boolean }): Promise<SignedTransaction>;
  setSigningKey(changePubKey: { feeToken: TokenLike; fee?: BigNumberish; nonce?: Nonce; ethAuthType: "ECDSA" | "ECDSALegacyMessage" }): Promise<Transaction>;
  isOnchainAuthSigningKeySet(nonce?: Nonce): Promise<boolean>;
  onchainAuthSigningKey(nonce?: Nonce, ethTxOptions?: ethers.providers.TransactionRequest): Promise<ContractTransaction>;
  getCurrentPubKeyHash(): Promise<PubKeyHash>;
  getNonce(nonce?: Nonce): Promise<number>;
  getAccountId(): Promise<number | undefined>;
  address(): Address;
  getAccountState(): Promise<AccountState>;
  getBalance(token: TokenLike, type?: "committed" | "verified"): Promise<BigNumber>;
  getEthereumBalance(token: TokenLike): Promise<BigNumber>;
  isERC20DepositsApproved(token: TokenLike): Promise<boolean>;
  approveERC20TokenDeposits(token: TokenLike, max_erc20_approve_amount?: BigNumber): Promise<ContractTransaction>;
  depositToSyncFromEthereum(deposit: {
    depositTo: Address;
    token: TokenLike;
    amount: BigNumberish;
    ethTxOptions?: ethers.providers.TransactionRequest;
    approveDepositAmountForERC20?: boolean;
  }): Promise<ETHOperation>;

  emergencyWithdraw(withdraw: { token: TokenLike; accountId?: number; ethTxOptions?: ethers.providers.TransactionRequest }): Promise<ETHOperation>;
  private modifyEthersError;
  private setRequiredAccountIdFromServer;
}

export declare class ETHOperation {
  ethTx: ContractTransaction;

  state: "Sent" | "Mined" | "Committed" | "Verified" | "Failed";
  error?: ZKSyncTxError;
  priorityOpId?: BigNumber;
  constructor(ethTx: ContractTransaction, zkSyncProvider: Provider);
  awaitEthereumTxCommit(): Promise<ethers.ContractReceipt>;
  awaitReceipt(): Promise<PriorityOperationReceipt>;
  awaitVerifyReceipt(): Promise<PriorityOperationReceipt>;
  private setErrorState;
}

export declare class Transaction {
  txData: any;
  txHash: string;
  sidechainProvider: Provider;
  state: "Sent" | "Committed" | "Verified" | "Failed";
  error?: ZKSyncTxError;
  constructor(txData: any, txHash: string, sidechainProvider: Provider);
  awaitReceipt(): Promise<TransactionReceipt>;
  awaitVerifyReceipt(): Promise<TransactionReceipt>;
  private setErrorState;
}

export interface BatchFee {
  totalFee: BigNumber;
}

export declare function getDefaultProvider(network: "localhost" | "rinkeby" | "ropsten" | "mainnet", transport?: "WS" | "HTTP"): Promise<Provider>;

declare class Subscription {
  unsubscribe: () => Promise<void>;
  constructor(unsubscribe: () => Promise<void>);
}

export interface walletData {
  [key: string]: object | undefined;
  syncProvider?: Provider;
  syncWallet?: Wallet;
  accountState?: AccountState;
  zkSync?: object;
}

export declare interface TransactionInfo {
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

export declare interface singleIcon {
  name: string;
  img: string;
  url: string;
  hideIn?: string;
}

export interface iWalletData {
  [key: string]: object | undefined;

  syncProvider?: Provider;
  syncWallet?: Wallet;
  accountState?: AccountState;
  zkSync?: object;
}

export declare interface depositTx {
  hash: string;
  amount: BigNumber | string;
  status: string;
  confirmations: number;
}

export declare interface zkEventBus {
  changeNetworkSet: () => void;
  changeNetworkHandle: (chainId: string) => void;
  changeAccountHandle: (data: any) => void;
}

export declare interface DepositsInterface {
  [tokenSymbol: string]: Array<depositTx>;
}
