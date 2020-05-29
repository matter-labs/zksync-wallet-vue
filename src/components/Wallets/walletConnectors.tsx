import Portis from '@portis/web3';
import Fortmatic from 'fortmatic';
import WalletConnectProvider from '@walletconnect/web3-provider';

export const portisConnector = (store, connect, getSigner) => {
  const portis = new Portis(process.env.REACT_APP_PORTIS || '', 'rinkeby');
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
  connect(wcProvider, wcProvider?.enable.bind(wcProvider));
};
