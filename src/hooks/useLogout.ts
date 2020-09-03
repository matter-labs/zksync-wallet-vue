import { useHistory, useLocation } from 'react-router-dom';
import { useCallback } from 'react';

import { useStore } from 'src/store/context';
import { WalletType } from 'src/constants/Wallets';

export function useLogout() {
  const store = useStore();
  const history = useHistory();
  const { pathname } = useLocation();

  const handleLogOut = useCallback(
    (accessModal: boolean, walletName: WalletType, withRedirect = false) => {
      if (withRedirect) {
        history.push({
          pathname: '/',
          search: `?redirect=${pathname.slice(1)}`,
        });
      } else {
        history.push('/');
      }
      store.performLogout(accessModal, walletName);
      window.location.reload();
    },
    [history, pathname, store],
  );

  return handleLogOut;
}
