import Fortmatic from 'fortmatic';
import WalletConnectProvider from '@walletconnect/web3-provider';

import { WalletLinkConnector } from './WalletLinkExtended/WalletLinkExtended';

import { Store } from 'src/store/store';

import { LINKS_CONFIG, INFURA_ID } from 'src/config';

import { COINBASE_LOCALSTORAGE_KEYS } from 'src/constants/Wallets';

export const browserWalletConnector = async (
  store: Store,
  connect,
  withConnect?,
) => {
  const browserProvider: any = window?.['ethereum'];
  store.provider = browserProvider;
  if (store.doesMetamaskUsesNewEthereumAPI) {
    const _accs = await browserProvider?.request({
      method: 'eth_accounts',
    });
    const signUpFunction = browserProvider?.request.bind(browserProvider, {
      method: 'eth_requestAccounts',
    });
    const prevState = await _accs[0];
    store.AccountStore.accountAddress = prevState;
    if (!!withConnect) connect(browserProvider, signUpFunction, prevState);
  } else {
    const signUpFunction = browserProvider?.enable.bind(browserProvider);
    const prevState = browserProvider?.selectedAddress;
    store.AccountStore.accountAddress = prevState;
    if (!!withConnect) connect(browserProvider, signUpFunction, prevState);
  }
};

export const portisConnector = async (
  store: Store,
  connect,
  getSigner,
  withConnect?,
) => {
  store.loginCounter += 1;
  if (store.loginCounter === 1) return;
  if (!store.isPortisWallet) return;
  const Portis = (await import('@portis/web3')).default;
  store.zkWalletInitializing = true;
  const portis = new Portis(
    process.env.REACT_APP_PORTIS || '',
    LINKS_CONFIG.network,
  );
  store.portisObject = portis;
  const portisProvider = portis.provider;
  store.provider = portisProvider;
  const signer = getSigner(portisProvider);
  const address = await signer.getAddress(signer);
  store.AccountStore.accountAddress = address;
  if (!!withConnect) connect(portisProvider, signer?.getAddress.bind(signer));
};

export const fortmaticConnector = async (
  store: Store,
  connect,
  getSigner,
  withConnect?,
) => {
  try {
    store.loginCounter += 1;
    if (store.loginCounter === 1) return;
    if (!store.isFortmaticWallet) return;
    store.zkWalletInitializing = true;
    const fm = new Fortmatic(process.env.REACT_APP_FORTMATIC);
    store.fortmaticObject = fm;
    const fmProvider = fm.getProvider();
    store.provider = fmProvider;
    fm?.user?.isLoggedIn().then(res => {
      store.AccountStore.isLoggedIn = res;
      if (res) {
        store.hint = 'Connected to ';
        store.zkWalletInitializing = false;
      }
    });
    const signer = getSigner(fmProvider);
    const address = await signer.getAddress(signer);
    store.zkWalletInitializing = false;
    store.AccountStore.accountAddress = address;
    if (!!withConnect) connect(fmProvider, signer?.getAddress.bind(signer));
  } catch (err) {
    store.walletName = '';
    store.isAccessModalOpen = false;
    window.location.reload();
  }
};

export const walletConnectConnector = (store: Store, connect) => {
  if (!store.isWalletConnect) return;
  const wcProvider = new WalletConnectProvider({
    infuraId: process.env.REACT_APP_WALLET_CONNECT,
  });
  store.provider = wcProvider;
  const wCQRScanned = localStorage.getItem('walletconnect');
  if (!!wCQRScanned) {
    store.zkWalletInitializing = true;
  }
  connect(wcProvider, wcProvider?.enable.bind(wcProvider));
};

export const burnerWalletConnector = store => {
  const createAccount = async () => {
    //dummy for future
  };
  createAccount();
};

export const externalAccountConnector = (store: Store) => {
  store.isAccessModalOpen = false;
  store.modalHintMessage = 'ExternalWalletLogin';
  store.modalSpecifier = 'modal-hint';
};

export const coinBaseConnector = (store: Store, connect?) => {
  if (!store.isCoinbaseWallet) return;
  const logged = localStorage.getItem(COINBASE_LOCALSTORAGE_KEYS.addresses);
  if (!!logged) {
    store.zkWalletInitializing = false;
    store.hint = 'Connected to ';
  } else {
    store.zkWalletInitializing = true;
  }
  if (store.isMobileDevice && connect) {
    browserWalletConnector(store, connect);
  } else {
    const walletLink = new WalletLinkConnector({
      url: `https://${LINKS_CONFIG.network}.infura.io/v3/${INFURA_ID}`,
      appName: 'zkSync',
      chainId: parseInt(LINKS_CONFIG.networkId),
      darkMode: store.darkMode,
      appLogoUrl: '//zksync.io/LogoHero.svg',
    });
    walletLink.activate().then(res => {
      store.zkWalletInitializing = false;
      store.hint = 'Connected to ';
      store.provider = res.provider;
      store.ethId = res.account as string;
      if (res.provider?._addresses)
        store.AccountStore.accountAddress = res.provider?._addresses[0];
    });
    store.walletLinkObject = walletLink;
  }
};
