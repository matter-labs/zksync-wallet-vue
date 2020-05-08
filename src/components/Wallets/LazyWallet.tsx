import React, { Suspense } from 'react';

import { WALLETS } from 'constants/Wallets';
import { useStore } from 'src/store/context';

const LazyWallet: React.FC = () => {
  const store = useStore();

  const Wallet = React.lazy(
    store.walletName && store.walletName in WALLETS
      ? WALLETS[store.walletName]
      : () => import('./DefaultWallet'),
  );

  return (
    <Suspense fallback={null}>
      <Wallet />
    </Suspense>
  );
};

export default LazyWallet;
