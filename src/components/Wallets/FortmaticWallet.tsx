import React, { useEffect } from 'react';
import Fortmatic from 'fortmatic';
import { useHistory } from 'react-router-dom';

import useWalletInit from '../../hooks/useWalletInit';
import { useRootData } from '../../hooks/useRootData';

import { DEFAULT_ERROR } from '../../constants/errors';

const FortmaticWallet: React.FC = (): JSX.Element => {
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
        const fm = new Fortmatic(process.env.REACT_APP_FORTMATIC);
        const fmProvider = fm.getProvider();
        setProvider(fmProvider);
        const signer = getSigner(fmProvider);
        connect(fmProvider, signer?.getAddress.bind(signer));
      }
    } catch (err) {
      err.name && err.message
        ? setError(`${err.name}:${err.message}. Maybe you don't have Metamask or Coinbase installed in your browser`)
        : setError(DEFAULT_ERROR);
      history.push('/');
      setWalletName('');
      setZkWallet(null);
      setProvider(null);
    }
  }, [connect, getSigner, provider, setProvider]);

  return <></>;
};

export default FortmaticWallet;
