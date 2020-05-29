import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import useWalletInit from 'hooks/useWalletInit';
import { fortmaticConnector } from './walletConnectors';

import { DEFAULT_ERROR } from 'constants/errors';
import { useStore } from 'src/store/context';

const FortmaticWallet: React.FC = () => {
  const { connect, getSigner } = useWalletInit();

  const store = useStore();

  const history = useHistory();

  useEffect(() => {
    try {
      fortmaticConnector(store, connect, getSigner);
    } catch (err) {
      store.error =
        err.name && err.message
          ? `${err.name}: ${err.message}. Maybe you don't have Fortmatic installed in your browser`
          : DEFAULT_ERROR;
      history.push('/');
      store.walletName = '';
      store.zkWallet = null;
      store.provider = null;
    }
  }, [connect, getSigner, history, store]);

  return null;
};

export default FortmaticWallet;
