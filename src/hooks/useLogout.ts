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
  } = useRootData(s => ({
    error: s.error.get(),
    provider: s.provider.get(),
    walletName: s.walletName.get(),
    zkWallet: s.zkWallet.get(),
    ...s,
  }));

  const history = useHistory();
  window['hookHistory'] = history;

  const handleLogOut = useCallback(() => {
    setModal('');
    setWalletName('');
    setAccessModal(false);
    setZkWallet(null);
    history.push('/');
  }, [
    history,
    setModal,
    setAccessModal,
    setProvider,
    setWalletName,
    setZkWallet,
  ]);

  return handleLogOut;
}
