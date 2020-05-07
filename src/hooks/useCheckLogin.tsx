import { useEffect } from 'react';
import { useRootData } from './useRootData';
import { useCancelable } from './useCancelable';
import { getWalletNameFromProvider } from 'src/utils';
import { WalletType } from 'src/constants/Wallets';
import { useQuery } from 'hooks/useQuery';
import { useStore } from 'src/store/context';
import { useMobxEffect } from './useMobxEffect';

export function useCheckLogin() {
  const params = useQuery();

  const store = useStore();

  const { walletName, provider, zkWallet } = store;
  // const {
  //   path,
  //   provider,
  //   setHintModal,
  //   setProvider,
  //   zkWallet,
  //   setWalletName,
  //   setAccessModal,
  //   walletName,
  // } = useRootData(s => ({
  //   ...s,
  //   path: s.path.get(),
  //   provider: s.provider.get(),
  //   zkWallet: s.zkWallet.get(),
  //   walletName: s.walletName.get(),
  // }));
  useMobxEffect(() => {
    const { provider, walletName } = store;
    if (provider && walletName) return;
    store.setBatch({
      isAccessModalOpen: true,
      provider: window['ethereum'],
      walletName: getWalletNameFromProvider() as WalletType,
    });
  }, [walletName, provider, zkWallet, params]);
  // useEffect(() => {
  //   if (provider && walletName) return;
  //   setAccessModal(true);
  //   setProvider(window['ethereum']);
  //   setWalletName(getWalletNameFromProvider() as WalletType);
  // }, [
  //   setWalletName,
  //   walletName,
  //   path,
  //   provider,
  //   zkWallet,
  //   cancelable,
  //   params,
  //   setHintModal,
  //   setProvider,
  //   setAccessModal,
  // ]);
}
