import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import useWalletInit from 'hooks/useWalletInit';
import { useMobxEffect } from 'src/hooks/useMobxEffect';

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
        const enableBrowserWallet = async () => {
          const browserProvider = window?.['ethereum'];
          store.provider = browserProvider;

          if (store.isMetamaskWallet && store.doesMetamaskUsesNewEthereumAPI) {
            const _accs = await window['ethereum']?.request({
              method: 'eth_accounts',
            });
            const signUpFunction = browserProvider?.request.bind(
              browserProvider,
              {
                method: 'eth_requestAccounts',
              },
            );
            const prevState = await _accs[0];
            connect(browserProvider, signUpFunction, prevState);
          } else {
            const signUpFunction = browserProvider?.enable.bind(
              browserProvider,
            );
            const prevState = window['ethereum'].selectedAddress;
            connect(browserProvider, signUpFunction, prevState);
          }
        };
        enableBrowserWallet();
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
