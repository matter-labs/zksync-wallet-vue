import React, { useEffect } from 'react';
import Portis from '@portis/web3';

import useWalletInit from '../../hooks/useWalletInit';
import { useRootData } from '../../hooks/useRootData';

const PortisWallet: React.FC = (): JSX.Element => {
  const { connect, getSigner } = useWalletInit();

  const { provider, setProvider } = useRootData(({ provider, setProvider }) => ({
    provider: provider.get(),
    setProvider,
  }));

  useEffect(() => {
    if (!provider) {
      const portis = new Portis(process.env.REACT_APP_PORTIS || '', 'mainnet');
      const portisProvider = portis.provider;
      setProvider(portisProvider);
      const signer = getSigner(portisProvider);
      connect(portisProvider, signer?.getAddress.bind(signer));
    }
  }, [connect, getSigner, provider, setProvider]);

  return <></>;
};

export default PortisWallet;
