import React, { useEffect } from 'react';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { useHistory } from 'react-router-dom';

import useWalletInit from 'hooks/useWalletInit';

import { walletConnectConnector } from './walletConnectors';

import { useStore } from 'src/store/context';
import { observer } from 'mobx-react-lite';

const WalletConnect: React.FC = observer(() => {
  const { connect, getSigner } = useWalletInit();
  const store = useStore();
  const history = useHistory();

  useEffect(() => {
    try {
      if (!store.provider) {
        walletConnectConnector(store, connect);
      }
    } catch (err) {
      if (err.name && err.message) {
        store.error = `${err.name}: ${err.message}`;
      }
      history.push('/');
      store.walletName = '';
      store.zkWallet = null;
      store.provider = null;
    }
  }, [store, connect, getSigner, history]);

  return null;
});

export default WalletConnect;
