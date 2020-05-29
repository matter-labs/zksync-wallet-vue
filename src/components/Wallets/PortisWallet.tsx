import React, { useEffect } from 'react';
import Portis from '@portis/web3';
import { useHistory } from 'react-router-dom';

import useWalletInit from 'hooks/useWalletInit';

import { DEFAULT_ERROR } from 'constants/errors';
import { useStore } from 'src/store/context';
import { observer } from 'mobx-react-lite';
import { portisConnector } from './walletConnectors';

const PortisWallet: React.FC = observer(() => {
  const { connect, getSigner } = useWalletInit();
  const store = useStore();
  const history = useHistory();

  useEffect(() => {
    const { provider } = store;
    try {
      portisConnector(store, connect, getSigner);
    } catch (err) {
      store.error =
        err.name && err.message
          ? `${err.name}: ${err.message}.`
          : DEFAULT_ERROR;
      history.push('/');
      store.walletName = '';
      store.zkWallet = null;
      store.provider = null;
    }
  }, [connect, getSigner, history, store]);

  return null;
});

export default PortisWallet;
