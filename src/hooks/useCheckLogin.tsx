import { useQuery } from 'hooks/useQuery';
import { useStore } from 'src/store/context';

export function useCheckLogin() {
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
  // useMobxEffect(() => {
  //   const { provider, walletName } = store;
  //   if (provider && walletName) return;
  //   store.setBatch({
  //     isAccessModalOpen: true,
  //     provider: window['ethereum'],
  //     walletName: getWalletNameFromProvider() as WalletType,
  //   });
  // }, [walletName, provider, zkWallet]);
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
