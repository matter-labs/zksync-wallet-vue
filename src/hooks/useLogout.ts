import { useHistory, useLocation } from 'react-router-dom';
import { useCallback } from 'react';

import { useStore } from 'src/store/context';

export function useLogout() {
  const store = useStore();
  const history = useHistory();
  const { pathname } = useLocation();
  // const {
  //   setAccessModal,
  //   setError,
  //   setHint,
  //   setModal,
  //   setProvider,
  //   setWalletName,
  //   setZkWallet,
  //   setZkBalances,
  //   setZkBalancesLoaded,
  //   setTxs,
  //   zkWalletInitializing,
  // } = useRootData(s => ({
  //   ...s,
  //   error: s.error.get(),
  //   provider: s.provider.get(),
  //   walletName: s.walletName.get(),
  //   zkWallet: s.zkWallet.get(),
  // }));

  const handleLogOut = useCallback(
    (accessModal, walletName, withRedirect = false) => {
      store.performLogout(accessModal, walletName);
      if (withRedirect) {
        history.push({
          pathname: '/',
          search: `?redirect=${pathname.slice(1)}`,
        });
      } else {
        history.push('/');
      }
    },
    [history, pathname, store],
  );

  return handleLogOut;
}
