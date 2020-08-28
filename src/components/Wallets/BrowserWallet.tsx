import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import useWalletInit from 'hooks/useWalletInit';
import { useMobxEffect } from 'src/hooks/useMobxEffect';

import { browserWalletConnector } from './walletConnectors';

import { useStore } from 'src/store/context';

import { browserWalletConnector } from './walletConnectors';

const BrowserWallet: React.FC = observer(() => {
  const { connect } = useWalletInit();
  const store = useStore();

  const history = useHistory();

  useMobxEffect(() => {
    const { provider, zkWallet, walletName } = store;

    try {
      if (!provider && !zkWallet && walletName) {
        browserWalletConnector(store, connect);
      }
    } catch (err) {
      if (err.name && err.message) {
        store.error = `${err.name}: ${err.message}. Maybe you don't have Metamask or Coinbase installed in your browser`;
      }
      history.push('/');
      store.setBatch({
        walletName: '',
        zkWallet: null,
        provider: null,
      });
    }
  }, [connect, history]);

  return null;
});

export default BrowserWallet;
