import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import useWalletInit from 'hooks/useWalletInit';

import { DEFAULT_ERROR } from 'constants/errors';
import { useStore } from 'src/store/context';
import { autorun } from 'mobx';
import { useObserver } from 'mobx-react-lite';

const BrowserWallet: React.FC = () => {
  const { connect } = useWalletInit();

  // const {
  //   provider,
  //   setError,
  //   setProvider,
  //   setWalletName,
  //   setZkWallet,
  // } = useRootData(
  //   ({ provider, setError, setProvider, setWalletName, setZkWallet }) => ({
  //     provider: provider.get(),
  //     setError,
  //     setProvider,
  //     setWalletName,
  //     setZkWallet,
  //   }),
  // );
  const store = useStore();

  const history = useHistory();
  console.log('Rendering BrowserWallet');

  useEffect(() => {
    const ar = autorun(() => {
      console.log({ provider: store.provider });
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
