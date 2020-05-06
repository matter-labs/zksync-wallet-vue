import { useEffect } from 'react';
import { useRootData } from './useRootData';
import { useCancelable } from './useCancelable';
import { getWalletNameFromProvider } from 'src/utils';
import { WalletType } from 'src/constants/Wallets';
import { useQuery } from 'hooks/useQuery';

export function useCheckLogin() {
  const params = useQuery();
  const {
    path,
    provider,
    setHint,
    setProvider,
    zkWallet,
    setWalletName,
    setAccessModal,
    walletName,
  } = useRootData(s => ({
    ...s,
    path: s.path.get(),
    provider: s.provider.get(),
    zkWallet: s.zkWallet.get(),
    walletName: s.walletName.get(),
  }));
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
    params,
    setHint,
    setProvider,
    setAccessModal,
  ]);
}
