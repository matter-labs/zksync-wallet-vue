import React, { useEffect, useState } from 'react';

import Footer from 'components/Footer/Footer';
import Header from 'components/Header/Header';
import Modal from 'components/Modal/Modal';

import { useRootData } from 'hooks/useRootData';

import { IAppProps } from 'types/Common';

import { RIGHT_NETWORK_ID, RIGHT_NETWORK_NAME } from 'constants/networks';
import { useWSHeartBeat } from 'hooks/useWSHeartbeat';
import { useLogout } from 'hooks/useLogout';
import { WalletType } from './constants/Wallets';
import { useCancelable } from './hooks/useCancelable';
import { useInterval } from './hooks/timers';

const App: React.FC<IAppProps> = ({ children }): JSX.Element => {
  const {
    error,
    isAccessModalOpen,
    provider,
    setAccessModal,
    setError,
    setWalletName,
    walletName,
    zkWallet,
    setZkBalances,
    setZkWallet,
    setHintModal,
    setBalances,
    setZkBalancesLoaded,
    setTxs,
  } = useRootData(
    ({ error, isAccessModalOpen, provider, walletName, zkWallet, ...s }) => ({
      ...s,
      error: error.get(),
      isAccessModalOpen: isAccessModalOpen.get(),
      provider: provider.get(),
      walletName: walletName.get(),
      zkWallet: zkWallet.get(),
    }),
  );

  useWSHeartBeat();
  const cancelable = useCancelable();
  const [curAddress, setCurAddress] = useState<string>(
    provider?.selectedAddress,
  );

  useEffect(() => {
    if (provider && walletName) {
      setCurAddress(provider?.selectedAddress);
    }
    if (curAddress && walletName) {
      setHintModal(`Login with ${walletName}`);
    }
  }, [curAddress, cancelable, provider, setHintModal, walletName]);

  useInterval(() => {
    if (!curAddress && walletName && provider?.selectedAddress) {
      setCurAddress(provider?.selectedAddress);
    }
  }, 5000);

  useEffect(() => {
    if (provider && walletName === 'Metamask') {
      window['ethereum'].autoRefreshOnNetworkChange = false;

      const networkChangeListener = () => {
        if (
          provider.networkVersion !== RIGHT_NETWORK_ID &&
          walletName === 'Metamask'
        ) {
          setError(`Wrong network, please switch to the ${RIGHT_NETWORK_NAME}`);
        } else {
          setError('');
        }
      };

      networkChangeListener();
      provider.on('networkChanged', networkChangeListener);
      return () => provider.off('networkChanged', networkChangeListener);
    }
  }, [provider, setError, walletName, zkWallet, cancelable]);

  const logout = useLogout();

  useEffect(() => {
    if (zkWallet) {
      setAccessModal(false);
    }
    if (!provider || walletName !== 'Metamask') return;
    const accountChangeListener = () => {
      if (
        zkWallet &&
        provider &&
        zkWallet?.address().toLowerCase() !==
          provider.selectedAddress.toLowerCase()
      ) {
        sessionStorage.setItem('walletName', walletName);
        const savedWalletName = sessionStorage.getItem(
          'walletName',
        ) as WalletType;
        if (savedWalletName) {
          setWalletName(savedWalletName);
        }
        setZkWallet(null);
        setZkBalances([]);
        setAccessModal(true);
        setZkBalancesLoaded(false);
        setTxs([]);
      }
    };
    provider.on('accountsChanged', accountChangeListener);
    return () => provider.off('accountsChanged', accountChangeListener);
  }, [
    logout,
    provider,
    setAccessModal,
    setWalletName,
    walletName,
    setZkBalances,
    setZkWallet,
    zkWallet,
  ]);

  return (
    <div className={`content-wrapper ${walletName ? '' : 'start-page'}`}>
      <Modal
        cancelAction={() => setError('')}
        visible={!!error}
        classSpecifier='error'
        background={true}
        centered
      >
        <p>{error}</p>
      </Modal>
      <Modal
        cancelAction={() => setAccessModal(false)}
        visible={
          isAccessModalOpen &&
          window.location.pathname.length > 1 &&
          provider &&
          provider.networkVersion === RIGHT_NETWORK_ID
        }
        classSpecifier='metamask'
        background={true}
        centered
      >
        <p>{'Please make sign in the pop up'}</p>
      </Modal>
      {walletName && <Header />}
      <div className='content'>{children}</div>
      <Footer />
    </div>
  );
};

export default App;
