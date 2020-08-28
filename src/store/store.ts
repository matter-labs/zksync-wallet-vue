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
import { ethers } from 'ethers';

export class Store {
  @observable autoLoginRequestStatus = sessionStorage.getItem(
    'autoLoginStatus',
  );
  @observable awaitedTokens = {};
  @observable awaitedTokensConfirmations = {};
  @observable depositModal = false;
  @observable withCloseMintModal = true;
  @observable txButtonUnlocked = true;
  @observable error = '';
  @observable isAccountBalanceNotEmpty = false;
  @observable isAccountBalanceLoading = true;
  @observable newContactName = '';
  @observable newContactAddress = '';
  @observable ethBalances: IEthBalance[] = [];
  @observable ethId = '';
  @observable ethWallet?: JsonRpcSigner | ethers.Signer;
  @observable EIP1271Signature = false;
  @observable isContact = false;
  @observable MLTTclaimed = false;
  @observable hint = '';
  @observable modalHintMessage = '';
  @observable normalBg = false;
  @observable isAccessModalOpen = false;
  @observable modalSpecifier = '';
  // path = observable.box<string>(window?.location.pathname);
  @observable price?: IPrice;
  // TODO: add explicit type
  @observable provider?: any;
  @observable propsMaxValue: any;
  @observable propsSymbolName: any;
  @observable propsToken: any;
  @observable searchBalances: IEthBalance[] = [];
  // TODO: add explicit type
  @observable searchContacts?: IContacts[] = [];
  // TODO: add explicit type
  @observable searchTransactions?: any;
  @observable tokens?: Tokens;
  @observable transactionModal?: ITransaction;
  @observable transactionType?: 'deposit' | 'withdraw' | 'transfer';
  @observable tokenInUnlockingProgress: string[] = [];
  @observable unlocked: boolean | undefined = undefined;
  @observable verifyToken = false;
  // TODO: add explicit type
  @observable verified: any;
  @observable walletName: WalletType = '';
  // TODO: add explicit type
  @observable walletAddress: IContactNameValue = {};
  @observable.shallow zkBalances: IEthBalance[] = [];
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

  @computed get isMetamaskWallet() {
    return this.walletName === 'Metamask';
  }

  @computed get isPortisWallet() {
    return this.walletName === 'Portis';
  }

  @computed get isWeb3() {
    return this.walletName === 'Web3';
  }

  @computed get isFortmaticWallet() {
    return this.walletName === 'Fortmatic';
  }

  @computed get isBurnerWallet() {
    return this.walletName === 'BurnerWallet';
  }

  @computed get isWalletConnect() {
    return this.walletName === 'WalletConnect';
  }

  @computed get isCoinbaseWallet() {
    return this.walletName === 'Coinbase Wallet';
  }

  @computed get isBraveBrowser() {
    return !!navigator['brave'];
  }

  @computed get doesMetamaskUsesNewEthereumAPI() {
    return !!window['ethereum']?.request;
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
    this.awaitedTokens = {};
    this.accountState = null;
    this.propsMaxValue = null;
    this.propsSymbolName = null;
    this.propsToken = null;
    this.isAccountBalanceLoading = true;
    this.isAccountBalanceNotEmpty = false;
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
