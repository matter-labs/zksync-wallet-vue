import { observable, action, computed } from 'mobx';

import {
  IContacts,
  IEthBalance,
  IPrice,
  ITransaction,
  IContactNameValue,
} from '../types/Common';
import { JsonRpcSigner } from 'ethers/providers/json-rpc-provider';
import { Tokens, AccountState } from 'zksync/build/types';
import { Wallet, Provider } from 'zksync';
import { WSTransport } from 'zksync/build/transport';
import { WalletType } from 'constants/Wallets';
import { Tx } from 'src/pages/Transactions';

export class Store {
  @observable awaitedTokens = {};
  @observable depositModal = false;
  @observable error = '';
  @observable ethBalances: IEthBalance[] = [];
  @observable ethId = '';
  @observable ethWallet?: JsonRpcSigner;
  @observable hint = '';
  @observable normalBg = false;
  @observable isAccessModalOpen = false;
  @observable modalSpecifier = '';
  // path = observable.box<string>(window?.location.pathname);
  @observable price?: IPrice;
  // TODO: add explicit type
  @observable provider?: any;
  @observable searchBalances: IEthBalance[] = [];
  // TODO: add explicit type
  @observable searchContacts?: IContacts[] = [];
  // TODO: add explicit type
  @observable searchTransactions?: any;
  @observable tokens?: Tokens;
  @observable transactionModal?: ITransaction;
  @observable transactionType?: 'deposit' | 'withdraw' | 'transfer';
  @observable unlocked = false;
  @observable verifyToken = false;
  // TODO: add explicit type
  @observable verified: any;
  @observable walletName: WalletType = '';
  // TODO: add explicit type
  @observable walletAddress: IContactNameValue = {};
  @observable zkBalances: IEthBalance[] = [];
  @observable zkBalancesLoaded = false;
  @observable zkWallet: Wallet | null = null;
  @observable zkWalletInitializing = false;
  @observable wsTransport: WSTransport | null = null;
  @observable wsBroken = false;
  @observable accountState: AccountState | null = null;
  @observable syncWallet?: Wallet;
  @observable syncProvider?: Provider;
  @observable transactions: Tx[] = [];
  @observable maxConfirmAmount = 25;

  @computed get zkWalletAddress() {
    return this.zkWallet?.address();
  }

  @action
  setTxs(transactions: ((prev: Tx[]) => Tx[]) | Tx[]) {
    if (typeof transactions === 'function') {
      this.transactions = transactions(this.transactions);
      return;
    }
    this.transactions = transactions;
  }

  @action
  performLogout(accessModal: boolean, walletName: WalletType) {
    this.modalSpecifier = '';
    this.error = '';
    this.walletName = walletName;
    this.isAccessModalOpen = accessModal;
    this.zkWallet = null;
    this.zkBalances = [];
    this.zkBalancesLoaded = false;
    this.transactions = [];
    this.provider = false;
    this.hint = '';
    this.zkWalletInitializing = false;
    this.searchBalances = [];
    this.searchContacts = [];
  }

  @action
  setBatch<K extends keyof Store>(batch: Record<K, any>) {
    Object.keys(batch).forEach(k => {
      this[k] = batch[k];
    });
  }

  constructor() {
    if (process.env.NODE_ENV === 'development') {
      // For debugging purpose
      Object.assign(window, { store: this });
    }
  }
}
