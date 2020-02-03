import React, { useEffect } from 'react';

import { useRootData } from '../../hooks/useRootData';
import useWalletInit from '../../hooks/useWalletInit';

const BrowserWallet: React.FC = (): JSX.Element => {
  const { connect, getSigner } = useWalletInit();

  const { provider, setProvider } = useRootData(({ provider, setProvider }) => ({
    provider: provider.get(),
    setProvider,
  }));

  useEffect(() => {
    if (!provider) {
      const signer = getSigner(window?.['ethereum']);
      const browserProvider = window?.['ethereum'];
      setProvider(browserProvider);
      connect(browserProvider, signer.getAddress.bind(signer));
    }
  }, [connect, getSigner, provider, setProvider]);
  return <></>;
};

export default BrowserWallet;
