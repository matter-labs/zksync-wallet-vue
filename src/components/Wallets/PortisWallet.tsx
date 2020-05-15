import React, { useEffect } from 'react';
import Portis from '@portis/web3';
import { useHistory } from 'react-router-dom';

import useWalletInit from 'hooks/useWalletInit';

import { DEFAULT_ERROR } from 'constants/errors';
import { useStore } from 'src/store/context';
import { observer } from 'mobx-react-lite';

const PortisWallet: React.FC = observer(() => {
  const { connect, getSigner } = useWalletInit();
  const store = useStore();
  const history = useHistory();

  useEffect(() => {
    const { provider } = store;
    try {
      if (!provider) {
        const portis = new Portis(
          process.env.REACT_APP_PORTIS || '',
          'mainnet',
        );
        const portisProvider = portis.provider;
        store.provider = portisProvider;
        const signer = getSigner(portisProvider);
        connect(portisProvider, signer?.getAddress.bind(signer));
      }
    } catch (err) {
      store.error =
        err.name && err.message
          ? `${err.name}: ${err.message}. Maybe you don't have Portis Wallet installed in your browser`
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
