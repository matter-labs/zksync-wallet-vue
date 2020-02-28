import React, { useEffect } from 'react';
import Portis from '@portis/web3';
import { useHistory } from 'react-router-dom';

import useWalletInit from '../../hooks/useWalletInit';
import { useRootData } from '../../hooks/useRootData';

import { DEFAULT_ERROR } from '../../constants/errors';

const PortisWallet: React.FC = (): JSX.Element => {
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
        const portis = new Portis(process.env.REACT_APP_PORTIS || '', 'mainnet');
        const portisProvider = portis.provider;
        setProvider(portisProvider);
        const signer = getSigner(portisProvider);
        connect(portisProvider, signer?.getAddress.bind(signer));
      }
    } catch (err) {
      err.name && err.message
        ? setError(`${err.name}:${err.message}. Maybe you don't have Portis Wallet installed in your browser`)
        : setError(DEFAULT_ERROR);
      history.push('/');
      setWalletName('');
      setZkWallet(null);
      setProvider(null);
    }
  }, [connect, getSigner, provider, setProvider]);

  return <></>;
};

export default PortisWallet;
