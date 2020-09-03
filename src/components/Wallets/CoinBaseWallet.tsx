import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import useWalletInit from 'hooks/useWalletInit';
import { coinBaseConnector, browserWalletConnector } from './walletConnectors';

import { useStore } from 'src/store/context';

const CoinBaseWallet: React.FC = () => {
  const { connect, getSigner, createWallet } = useWalletInit();

  const store = useStore();

  const history = useHistory();

  useEffect(() => {
    try {
      store.isMobileDevice
        ? browserWalletConnector(store, connect)
        : coinBaseConnector(store, connect);
    } catch (err) {
      if (err.name && err.message) {
        store.error = `${err.name}: ${err.message}`;
      }
      history.push('/');
      store.walletName = '';
      store.zkWallet = null;
      store.provider = null;
    }
  }, [connect, getSigner, history, store]);

  return null;
};

export default CoinBaseWallet;
