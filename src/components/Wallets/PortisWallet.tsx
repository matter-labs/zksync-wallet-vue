import React, { useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import useWalletInit from 'hooks/useWalletInit';

import { useStore } from 'src/store/context';
import { observer } from 'mobx-react-lite';
import { portisConnector } from './walletConnectors';

const PortisWallet: React.FC = observer(() => {
  const { connect, getSigner } = useWalletInit();
  const store = useStore();
  const history = useHistory();

  const run = useCallback(async () => {
    try {
      await portisConnector(store, connect, getSigner);
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

  useEffect(() => {
    run();
  }, [run]);

  return null;
});

export default PortisWallet;
