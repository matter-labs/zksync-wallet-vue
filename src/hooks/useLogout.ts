import { useHistory } from 'react-router-dom';
import { useCallback } from 'react';

import { useRootData } from 'hooks/useRootData';

export function useLogout() {
  const {
    setAccessModal,
    setModal,
    setProvider,
    setWalletName,
    setZkWallet,
    setZkBalances,
  } = useRootData(s => ({
    ...s,
    error: s.error.get(),
    provider: s.provider.get(),
    walletName: s.walletName.get(),
    zkWallet: s.zkWallet.get(),
  }));

  const history = useHistory();

  const handleLogOut = useCallback(
    (accessModal, name) => {
      setModal('');
      setWalletName(name);
      setAccessModal(accessModal);
      setZkWallet(null);
      setZkBalances([]);
      history.push('/');
    },
    [
      history,
      setModal,
      setAccessModal,
      setProvider,
      setWalletName,
      setZkWallet,
    ],
  );

  return handleLogOut;
}
