import React, { useEffect } from 'react';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { useHistory } from 'react-router-dom';

import useWalletInit from '../../hooks/useWalletInit';
import { useRootData } from '../../hooks/useRootData';

import { DEFAULT_ERROR } from '../../constants/errors';

const WalletConnect: React.FC = (): JSX.Element => {
  const { connect, getSigner } = useWalletInit();

  const { provider, setError, setProvider, setWalletName, setZkWallet } = useRootData(
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
        const wcProvider = new WalletConnectProvider({
          infuraId: process.env.REACT_APP_WALLET_CONNECT,
        });
        setProvider(wcProvider);
        connect(wcProvider, wcProvider?.enable.bind(wcProvider));
      }
    } catch (err) {
      err.name && err.message
        ? setError(`${err.name}:${err.message}. Maybe you don't have Wallet Connect installed in your browser`)
        : setError(DEFAULT_ERROR);
      history.push('/');
      setWalletName('');
      setZkWallet(null);
      setProvider(null);
    }
  }, [connect, getSigner, history, provider, setError, setProvider, setWalletName, setZkWallet]);

  return <></>;
};

export default WalletConnect;
