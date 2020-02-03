import React, { Suspense } from 'react';

import { useRootData } from '../../hooks/useRootData';

import { WALLETS } from '../../constants/Wallets';

const LazyWallet: React.FC = (): JSX.Element => {
  const { walletName } = useRootData(({ walletName }) => ({
    walletName: walletName.get(),
  }));

  const Wallet = React.lazy(walletName ? WALLETS[walletName] : () => import('./DefaultWallet'));

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Wallet />
    </Suspense>
  );
};

export default LazyWallet;
