import React from 'react';
import { useHistory } from 'react-router-dom';

import useWalletInit from 'hooks/useWalletInit';
import { useMobxEffect } from 'src/hooks/useMobxEffect';

import { DEFAULT_ERROR } from 'constants/errors';
import { useStore } from 'src/store/context';
import { observer } from 'mobx-react-lite';

const BrowserWallet: React.FC = observer(() => {
  const { connect } = useWalletInit();
  const store = useStore();

  const history = useHistory();

  useMobxEffect(() => {
    const { provider, zkWallet, walletName } = store;
    try {
      if (!provider && !zkWallet && walletName) {
        const browserProvider = window?.['ethereum'];
        store.provider = browserProvider;
        connect(browserProvider, browserProvider?.enable.bind(browserProvider));
      }
    } catch (err) {
      store.error =
        err.name && err.message
          ? `${err.name}: ${err.message}. Maybe you don't have Metamask or Coinbase installed in your browser`
          : DEFAULT_ERROR;
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
