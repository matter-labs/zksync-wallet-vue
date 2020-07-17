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
          const _accs = await window['ethereum']?.request({
            method: 'eth_accounts',
          });
          const browserProvider = window?.['ethereum'];
          store.provider = browserProvider;
          const signUpFunction = store.isMetamaskWallet
            ? browserProvider?.request.bind(browserProvider, {
                method: 'eth_requestAccounts',
              })
            : browserProvider?.enable.bind(browserProvider);
          const prevState = store.isMetamaskWallet
            ? await _accs[0]
            : window['ethereum'].selectedAddress;
          if (!!browserProvider) {
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
