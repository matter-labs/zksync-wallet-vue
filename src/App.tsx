import React, { useEffect, useCallback } from 'react';

import Footer from 'components/Footer/Footer';
import Header from 'components/Header/Header';
import Modal from 'components/Modal/Modal';

import { useRootData } from 'hooks/useRootData';
import useWalletInit from 'hooks/useWalletInit';

import { IAppProps } from 'types/Common';

import { RIGHT_NETWORK_ID, RIGHT_NETWORK_NAME } from 'constants/networks';
import { useWSHeartBeat } from 'hooks/useWSHeartbeat';
import { useLogout } from 'hooks/useLogout';
import { WalletType } from './constants/Wallets';

import * as zksync from 'zksync';

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
    setZkWallet,
  } = useRootData(
    ({
      error,
      isAccessModalOpen,
      provider,
      setAccessModal,
      setError,
      setModal,
      setProvider,
      setWalletName,
      setZkWallet,
      walletName,
      zkWallet,
    }) => ({
      error: error.get(),
      isAccessModalOpen: isAccessModalOpen.get(),
      provider: provider.get(),
      setAccessModal,
      setError,
      setModal,
      setProvider,
      setWalletName,
      setZkWallet,
      walletName: walletName.get(),
      zkWallet: zkWallet.get(),
    }),
  );

  useWSHeartBeat();
  const { createWallet } = useWalletInit();

  const handleNetworkChange = useCallback(() => {
    if (walletName === 'Metamask') {
      provider.on('networkChanged', () => {
        if (
          window.location.pathname.length <= 1 &&
          provider?.networkVersion === RIGHT_NETWORK_ID
        ) {
          createWallet();
        }
      });
    }
  }, [
    createWallet,
    provider,
    setAccessModal,
    setWalletName,
    walletName,
    zkWallet,
  ]);

  useEffect(() => {
    if (provider && window['ethereum']) {
      window['ethereum'].autoRefreshOnNetworkChange = false;
      handleNetworkChange();
    }
    if (provider && walletName && walletName === 'Metamask') {
      provider.on('networkChanged', () => {
        provider.networkVersion !== RIGHT_NETWORK_ID &&
        walletName === 'Metamask'
          ? setError(
              `Wrong network, please switch to the ${RIGHT_NETWORK_NAME}`,
            )
          : setError('');
      });
    }
  }, [
    createWallet,
    handleNetworkChange,
    provider,
    setError,
    walletName,
    zkWallet,
  ]);

  const logout = useLogout();

  useEffect(() => {
    if (!!zkWallet) {
      setAccessModal(false);
    }
    if (!provider || walletName.toLowerCase() !== 'metamask') return;
    provider.on('accountsChanged', () => {
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
        setAccessModal(true);
      }
    });
  }, [
    logout,
    provider,
    setAccessModal,
    setWalletName,
    walletName,
    setZkWallet,
    zkWallet,
  ]);

  const df = async () => await import('zksync');

  console.dir(df());

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
        classSpecifier='acc'
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
