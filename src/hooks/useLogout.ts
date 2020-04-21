import { useHistory, useLocation } from 'react-router-dom';
import { useCallback } from 'react';

import { useRootData } from 'hooks/useRootData';

export function useLogout() {
  const history = useHistory();
  const { pathname } = useLocation();
  const {
    setAccessModal,
    setModal,
    setWalletName,
    setZkWallet,
    setZkBalances,
    setTxs,
  } = useRootData(s => ({
    ...s,
    error: s.error.get(),
    provider: s.provider.get(),
    walletName: s.walletName.get(),
    zkWallet: s.zkWallet.get(),
  }));

  const handleLogOut = useCallback(
    (accessModal, name, withRedirect = false) => {
      setModal('');
      setWalletName(name);
      setAccessModal(accessModal);
      setZkWallet(null);
      setZkBalances([]);
      setTxs([]);
      if (withRedirect) {
        history.push({
          pathname: '/',
          search: `?redirect=${pathname.slice(1)}`,
        });
      } else {
        history.push('/');
      }
    },
    [
      history,
      setModal,
      setAccessModal,
      setWalletName,
      setZkWallet,
      pathname,
      setZkBalances,
      setTxs,
    ],
  );

  return handleLogOut;
}
