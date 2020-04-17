import { observable } from 'mobx';

import { IEthBalance, IPrice, ITransaction } from '../types/Common';
import { JsonRpcSigner } from 'ethers/providers/json-rpc-provider';
import { Tokens } from 'zksync/build/types';
import { Wallet } from 'zksync';
import { WSTransport } from 'zksync/build/transport';
import { WalletType } from 'constants/Wallets';
import { Tx } from 'src/pages/Transactions';

export const createStore = () => ({
  depositModal: observable.box<boolean>(false),
  error: observable.box<string>(''),
  ethBalances: observable.box<IEthBalance[]>([]),
  ethId: observable.box<string>(''),
  ethWallet: observable.box<JsonRpcSigner>(),
  hintModal: observable.box<string>(''),
  normalBg: observable.box<boolean>(false),
  isAccessModalOpen: observable.box<boolean>(false),
  isModalOpen: observable.box<string>(''),
  path: observable.box<string>(window?.location.pathname),
  price: observable.box<IPrice>(),
  provider: observable.box<any>(),
  searchBalances: observable.box<IEthBalance[]>([]),
  searchContacts: observable.box<any>(),
  searchTransactions: observable.box<any>(),
  tokens: observable.box<Tokens>(),
  transactionModal: observable.box<ITransaction>(),
  transactionType: observable.box<
    'deposit' | 'withdraw' | 'transfer' | undefined
  >(undefined),
  unlocked: observable.box<boolean | undefined>(undefined),
  verifyToken: observable.box<boolean | undefined>(undefined),
  walletName: observable.box<WalletType>(''),
  walletAddress: observable.box<any>([]),
  zkBalances: observable.box<IEthBalance[]>([]),
  zkBalancesLoaded: observable.box<boolean>(false),
  zkWallet: observable.box<Wallet | null>(),
  wsTransport: observable.box<WSTransport | null>(null),
  wsBroken: observable.box(false),

  transactions: observable.array<Tx>([]),
  // transactions: observable<{ loaded: boolean; value: Tx[] }>({
  //   loaded: false,
  //   value: [],
  // }),

  setAccessModal(isOpen: boolean): void {
    this.isAccessModalOpen.set(isOpen);
  },

  setBalances(searchBalances: any): void {
    this.searchBalances.set(searchBalances);
  },

  setContacts(searchContacts: any): void {
    this.searchContacts.set(searchContacts);
  },

  setDepositModal(depositModal: boolean): void {
    this.depositModal.set(depositModal);
  },

  setError(error: string): void {
    this.error.set(error);
  },

  setEthBalances(balances: IEthBalance[]): void {
    this.ethBalances.set(balances);
  },

  setEthId(id: string): void {
    this.ethId.set(id);
  },

  setEthWallet(wallet: JsonRpcSigner): void {
    this.ethWallet.set(wallet);
  },

  setHintModal(text: string): void {
    this.hintModal.set(text);
  },

  setNormalBg(normalBg: boolean): void {
    this.normalBg.set(normalBg);
  },

  setModal(isModalOpen: string): void {
    this.isModalOpen.set(isModalOpen);
  },

  setPath(path: string): void {
    this.path.set(path);
  },

  setPrice(value) {
    this.price.set(value);
  },

  setProvider(provider: any): void {
    this.provider.set(provider);
  },

  setTokens(tokens: Tokens): void {
    this.tokens.set(tokens);
  },

  setTransactionModal(transactionModal: ITransaction): void {
    this.transactionModal.set(transactionModal);
  },

  setTransactions(searchTransactions: any): void {
    this.searchTransactions.set(searchTransactions);
  },

  setTransactionType(
    transaction: 'deposit' | 'withdraw' | 'transfer' | undefined,
  ) {
    this.transactionType.set(transaction);
  },

  setUnlocked(unlockedStatus: boolean | undefined) {
    this.unlocked.set(unlockedStatus);
  },

  setVerifyToken(verified: boolean | undefined) {
    this.verifyToken.set(verified);
  },

  setWalletAddress(walletAddress: any): void {
    this.walletAddress.set(walletAddress);
  },

  setWalletName(name: WalletType): void {
    this.walletName.set(name);
  },

  setZkBalances(balances: IEthBalance[]): void {
    this.zkBalances.set(balances);
  },

  setZkBalancesLoaded(balances: boolean): void {
    this.zkBalancesLoaded.set(balances);
  },

  setZkWallet(wallet: Wallet | null): void {
    this.zkWallet.set(wallet);
  },

  setWSTransport(t: WSTransport | null) {
    this.wsTransport.set(t);
  },

  setWsStatus(broken: boolean) {
    this.wsBroken.set(broken);
  },

  setTxsLoaded(loaded = true) {
    // this.transactions.loaded = loaded;
  },

  setTxs(transactions: ((prev: Tx[]) => Tx[]) | Tx[]) {
    if (typeof transactions === 'function') {
      this.transactions.replace(transactions(this.transactions));
      return;
    }
    this.transactions.replace(transactions);
  },

  performLogout(accessModal = false, walletName: WalletType = '') {
    this.setModal('');
    this.setWalletName(walletName);
    this.setAccessModal(accessModal);
    this.setZkWallet(null);
    this.setZkBalances([]);
    this.setProvider(undefined);
  },
});

export type TStore = ReturnType<typeof createStore>;
