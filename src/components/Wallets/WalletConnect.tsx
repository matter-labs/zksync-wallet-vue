import React, { useEffect } from 'react';
import WalletConnectProvider from '@walletconnect/web3-provider';

import useWalletInit from '../../hooks/useWalletInit';
import { useRootData } from '../../hooks/useRootData';

const WalletConnect: React.FC = (): JSX.Element => {
  const { connect, getSigner } = useWalletInit();

  const { provider, setProvider } = useRootData(({ provider, setProvider }) => ({
    provider: provider.get(),
    setProvider,
  }));

  useEffect(() => {
    if (!provider) {
      const wcProvider = new WalletConnectProvider({
        infuraId: process.env.REACT_APP_WALLET_CONNECT,
      });
      setProvider(wcProvider);
      connect(wcProvider, wcProvider.enable.bind(wcProvider));
    }
  }, [connect, getSigner, provider, setProvider]);

  return <></>;
};

export default WalletConnect;
