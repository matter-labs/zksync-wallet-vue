import Fortmatic from 'fortmatic';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { LINKS_CONFIG } from 'src/config';

export const browserWalletConnector = async (store, connect) => {
  const browserProvider = window?.['ethereum'];
  store.provider = browserProvider;

  if (store.isMetamaskWallet && store.doesMetamaskUsesNewEthereumAPI) {
    const _accs = await window['ethereum']?.request({
      method: 'eth_accounts',
    });
    const signUpFunction = browserProvider?.request.bind(browserProvider, {
      method: 'eth_requestAccounts',
    });
    const prevState = await _accs[0];
    connect(browserProvider, signUpFunction, prevState);
  } else {
    const signUpFunction = browserProvider?.enable.bind(browserProvider);
    const prevState = window['ethereum'].selectedAddress;
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
