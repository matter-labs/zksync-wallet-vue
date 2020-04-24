import { useEffect } from 'react';
import { useRootData } from './useRootData';
import useWalletInit from './useWalletInit';
import { useCancelable } from './useCancelable';
import { getWalletNameFromProvider } from 'src/utils';
import { WalletType } from 'src/constants/Wallets';
import { useQuery } from 'hooks/useQuery';

import { RIGHT_NETWORK_ID, RIGHT_NETWORK_NAME } from 'constants/networks';

export function useCheckLogin() {
  const params = useQuery();
  const {
    path,
    provider,
    setHintModal,
    setProvider,
    zkWallet,
    setWalletName,
    setAccessModal,
    setError,
    walletName,
  } = useRootData(s => ({
    ...s,
    path: s.path.get(),
    provider: s.provider.get(),
    zkWallet: s.zkWallet.get(),
    walletName: s.walletName.get(),
  }));
  const { createWallet } = useWalletInit();
  const cancelable = useCancelable();

  useEffect(() => {
    if (provider && walletName) return;
    setAccessModal(true);
    setProvider(window['ethereum']);
    setWalletName(getWalletNameFromProvider() as WalletType);
  }, [
    setWalletName,
    walletName,
    path,
    provider,
    zkWallet,
    cancelable,
    createWallet,
    params,
    setHintModal,
    setProvider,
    setAccessModal,
  ]);
}
