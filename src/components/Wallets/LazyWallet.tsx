import React, { Suspense } from 'react';

import { useRootData } from 'hooks/useRootData';

import { WALLETS } from 'constants/Wallets';

const LazyWallet: React.FC = () => {
  const { walletName } = useRootData(({ walletName }) => ({
    walletName: walletName.get(),
  }));

  const Wallet = React.lazy(
    walletName && walletName in WALLETS
      ? WALLETS[walletName]
      : () => import('./DefaultWallet'),
  );

  return (
    <Suspense fallback={null}>
      <Wallet />
    </Suspense>
  );
};

export default LazyWallet;
