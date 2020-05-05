import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import useWalletInit from 'hooks/useWalletInit';

import { DEFAULT_ERROR } from 'constants/errors';
import { useStore } from 'src/store/context';
import { autorun } from 'mobx';

const BrowserWallet: React.FC = () => {
  const { connect } = useWalletInit();
  const store = useStore();

  const history = useHistory();

  useEffect(() => {
    const ar = autorun(() => {
      try {
        if (!store.provider) {
          const browserProvider = window?.['ethereum'];
          store.provider = browserProvider;
          connect(
            browserProvider,
            browserProvider?.enable.bind(browserProvider),
          );
        }
      } catch (err) {
        store.error =
          err.name && err.message
            ? `${err.name}: ${err.message}. Maybe you don't have Metamask or Coinbase installed in your browser`
            : DEFAULT_ERROR;
        history.push('/');
        store.walletName = '';
        store.zkWallet = null;
        store.provider = null;
      }
    });
    return ar;
  }, [connect, history, store]);

  return null;
};

export default BrowserWallet;
