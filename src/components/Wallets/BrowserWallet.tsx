import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { useRootData } from 'hooks/useRootData';
import useWalletInit from 'hooks/useWalletInit';

import { DEFAULT_ERROR } from 'constants/errors';

const BrowserWallet: React.FC = () => {
  const { connect } = useWalletInit();

  const {
    provider,
    setError,
    setProvider,
    setWalletName,
    setZkWallet,
  } = useRootData(
    ({ provider, setError, setProvider, setWalletName, setZkWallet }) => ({
      provider: provider.get(),
      setError,
      setProvider,
      setWalletName,
      setZkWallet,
    }),
  );

  const history = useHistory();

  useEffect(() => {
    try {
      if (!provider) {
        const browserProvider = window?.['ethereum'];
        setProvider(browserProvider);
        connect(browserProvider, browserProvider?.enable.bind(browserProvider));
      }
    } catch (err) {
      err.name && err.message
        ? setError(
            `${err.name}: ${err.message}. Maybe you don't have Metamask or Coinbase installed in your browser`,
          )
        : setError(DEFAULT_ERROR);
      history.push('/');
      setWalletName('');
      setZkWallet(null);
      setProvider(null);
    }
  }, [
    connect,
    history,
    provider,
    setError,
    setProvider,
    setWalletName,
    setZkWallet,
  ]);

  return null;
};

export default BrowserWallet;
