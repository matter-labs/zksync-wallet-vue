import { useEffect } from 'react';
import { useRootData } from './useRootData';
import { useLocation, useHistory } from 'react-router-dom';
import useWalletInit from './useWalletInit';
import { useCancelable } from './useCancelable';
import { getWalletNameFromProvider } from 'src/utils';
import { WalletType } from 'src/constants/Wallets';

export function useCheckLogin() {
  const { pathname } = useLocation();
  const history = useHistory();
  const { provider, setProvider, zkWallet, setWalletName } = useRootData(s => ({
    ...s,
    provider: s.provider.get(),
    zkWallet: s.zkWallet.get(),
  }));
  const { createWallet } = useWalletInit();
  const cancelable = useCancelable();

  useEffect(() => {
    if (zkWallet || !provider) return;
    cancelable(createWallet());
  }, [provider]);

  useEffect(() => {
    const ethprovider = window['ethereum'];
    if (provider) return;
    if (ethprovider?.selectedAddress) {
      const walletName = getWalletNameFromProvider()! as WalletType;
      setProvider(ethprovider);
      setWalletName(walletName);
    } else {
      history.push({ pathname: '/', search: `?redirect=${pathname.slice(1)}` });
    }
  }, [history, provider, pathname]);
}
