import Fortmatic from 'fortmatic';
import WalletConnectProvider from '@walletconnect/web3-provider';

import { WalletLinkConnector } from './WalletLinkExtended/WalletLinkExtended';

import { Store } from 'src/store/store';

import { LINKS_CONFIG, INFURA_ID } from 'src/config';

export const browserWalletConnector = async (store: Store, connect) => {
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
    connect(browserProvider, signUpFunction, prevState);
  } else {
    const signUpFunction = browserProvider?.enable.bind(browserProvider);
    const prevState = browserProvider?.selectedAddress;
    connect(browserProvider, signUpFunction, prevState);
  }
};

export const portisConnector = async (store, connect, getSigner) => {
  const Portis = (await import('@portis/web3')).default;
  const portis = new Portis(
    process.env.REACT_APP_PORTIS || '',
    LINKS_CONFIG.network,
  );
  const portisProvider = portis.provider;
  store.provider = portisProvider;
  const signer = getSigner(portisProvider);
  connect(portisProvider, signer?.getAddress.bind(signer));
};

export const fortmaticConnector = (store, connect, getSigner) => {
  const fm = new Fortmatic(process.env.REACT_APP_FORTMATIC);
  const fmProvider = fm.getProvider();
  store.provider = fmProvider;
  const signer = getSigner(fmProvider);
  connect(fmProvider, signer?.getAddress.bind(signer));
};

export const walletConnectConnector = (store, connect) => {
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
      store.provider = res.provider;
      store.ethId = res.account as string;
    });
    store.walletLinkObject = walletLink;
  }
};
