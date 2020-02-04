import React, { useEffect } from 'react';

import { useRootData } from '../../hooks/useRootData';
import useWalletInit from '../../hooks/useWalletInit';

const BrowserWallet: React.FC = (): JSX.Element => {
  const { connect } = useWalletInit();

  const { provider, setProvider } = useRootData(({ provider, setProvider }) => ({
    provider: provider.get(),
    setProvider,
  }));

  useEffect(() => {
    if (!provider) {
      const browserProvider = window?.['ethereum'];
      setProvider(browserProvider);
      connect(browserProvider, browserProvider.enable.bind(browserProvider));
    }
  }, [connect, provider, setProvider]);
  return <></>;
};

export default BrowserWallet;
