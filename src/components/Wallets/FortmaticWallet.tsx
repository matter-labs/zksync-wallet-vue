import React, { useEffect } from 'react';
import Fortmatic from 'fortmatic';

import useWalletInit from '../../hooks/useWalletInit';
import { useRootData } from '../../hooks/useRootData';

const FortmaticWallet: React.FC = (): JSX.Element => {
  const { connect, getSigner } = useWalletInit();

  const { provider, setProvider } = useRootData(({ provider, setProvider }) => ({
    provider: provider.get(),
    setProvider,
  }));

  useEffect(() => {
    if (!provider) {
      const fm = new Fortmatic(process.env.REACT_APP_FORTMATIC);
      const fmProvider = fm.getProvider();
      setProvider(fmProvider);
      const signer = getSigner(fmProvider);
      connect(fmProvider, signer.getAddress.bind(signer));
    }
  }, [connect, getSigner, provider, setProvider]);

  return <></>;
};

export default FortmaticWallet;
