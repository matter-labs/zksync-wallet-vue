import React from 'react';
import { useHistory } from 'react-router-dom';
import { burnerWalletConnector } from 'components/Wallets/walletConnectors';

import useWalletInit from 'hooks/useWalletInit';
import { useMobxEffect } from 'src/hooks/useMobxEffect';

import { useStore } from 'src/store/context';
import { observer } from 'mobx-react-lite';

const BurnerWallet: React.FC = observer(() => {
  const { connect } = useWalletInit();
  const store = useStore();

  const history = useHistory();

  useMobxEffect(() => {
    try {
      burnerWalletConnector(store);
    } catch (err) {
      if (err.name && err.message) {
        store.error = `${err.name}: ${err.message}`;
      }
      history.push('/');
      store.setBatch({
        walletName: '',
        zkWallet: null,
        provider: null,
      });
    }
  }, []);

  return null;
});

export default BurnerWallet;
