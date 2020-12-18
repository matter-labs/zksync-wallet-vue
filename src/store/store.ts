import { observable, action, computed } from 'mobx';

import {
  IContacts,
  IEthBalance,
  ITransaction,
  IContactNameValue,
} from 'types/Common';
import { ExternaWalletStore } from './externalWalletStore';
import { TransactionStore } from './transactionStore';
import { AccountStore } from './accountStore';
import { TokensStore } from './tokensStore';

import { AccountState } from 'zksync/build/types';
import { Wallet, Provider } from 'zksync';
import { WSTransport } from 'zksync/build/transport';
import { WalletType } from 'constants/Wallets';
import { Tx } from 'src/pages/Transactions';
import { ethers } from 'ethers';
import { MOBILE_DEVICE } from 'constants/regExs';
import { WIDTH_BP } from 'constants/magicNumbers';

export class Store {
  @observable ExternaWalletStore = new ExternaWalletStore();
  @observable TransactionStore = new TransactionStore();
  @observable AccountStore = new AccountStore();
  @observable TokensStore = new TokensStore();

  @observable abiText: any = '';
  @observable autoLoginRequestStatus = sessionStorage.getItem(
    'autoLoginStatus',
  );

  @observable changePubKeyFee = 0;
  @observable depositModal = false;
  @observable darkMode = false;
  @observable txButtonUnlocked = true;
  @observable error = '';
  @observable fortmaticObject: any = {};
  @observable newContactName = '';
  @observable newContactAddress = '';
  @observable loginCounter = 0;
  @observable ethId = '';
  @observable ethWallet?: ethers.providers.JsonRpcSigner | ethers.Signer;
  @observable EIP1271Signature = false;
  @observable isContact = false;
  @observable hint = '';
  @observable modalHintMessage = '';
  @observable normalBg = false;
  @observable isAccessModalOpen = false;
  @observable modalSpecifier = '';
  // path = observable.box<string>(window?.location.pathname);
  // TODO: add explicit type
  @observable provider?: any;
  @observable portisObject: any = {};
  @observable searchBalances: IEthBalance[] = [];
  // TODO: add explicit type
  @observable searchContacts?: IContacts[] = [];
  // TODO: add explicit type
  @observable searchTransactions?: any;
  @observable transactionModal?: ITransaction;
  @observable transactionType?: 'deposit' | 'withdraw' | 'transfer';
  @observable unlocked: boolean | undefined = undefined;
  @observable verifyToken = false;
  // TODO: add explicit type
  @observable verified: any;
  @observable walletName: WalletType = '';
  // TODO: remove in favor of the component
  @observable ExternalWallerShowWithdraw = false;
  @observable ExternalWallerAfterClick = '';
  // TODO: add explicit type
  @observable walletAddress: IContactNameValue = {};
  @observable zkWallet: Wallet | null = null;
  @observable zkWalletInitializing = false;
  @observable wsTransport: WSTransport | null = null;
  @observable wsBroken = false;
  @observable accountState: AccountState | null = null;
  @observable syncWallet?: Wallet;
  @observable syncProvider?: Provider;
  @observable transactions: Tx[] = [];
  @observable maxConfirmAmount = 25;
  @observable windowEthereumProvider: any = window['ethereum'];
  @observable walletLinkObject: any = {};

  @computed get isPrimaryPage() {
    return window.location.pathname.length <= 1;
  }

  @computed get isMobileDevice() {
    return (
      MOBILE_DEVICE.test(navigator.userAgent) || window?.innerWidth < WIDTH_BP
    );
  }

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

  @computed get isExternalWallet() {
    return this.walletName === 'External';
  }

  @computed get doesMetamaskUsesNewEthereumAPI() {
    return !!this.windowEthereumProvider?.request;
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
    /* Need to save commented in order of future bugs **/
    this.modalSpecifier = '';
    this.isAccessModalOpen = accessModal;
    this.normalBg = false;
    this.zkWallet = null;
    // this.AccountStore.accountChanging = true;
    // this.error = '';
    // this.zkBalances = [];
    // this.zkBalancesLoaded = false;
    // this.transactions = [];
    // this.provider = false;
    // this.hint = '';
    // this.syncWallet = undefined;
    // this.syncProvider = undefined;
    // this.zkWalletInitializing = false;
    // this.ExternaWalletStore.externalWalletInitializing = false;
    // this.searchBalances = [];
    // this.searchContacts = [];
    // this.awaitedTokens = {};
    // this.accountState = null;
    // this.propsMaxValue = null;
    // this.propsSymbolName = null;
    // this.propsToken = null;
    // this.isAccountBalanceLoading = true;
    // this.isAccountBalanceNotEmpty = false;
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
