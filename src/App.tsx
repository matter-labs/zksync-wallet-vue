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

const App: React.FC<IAppProps> = ({ children }): JSX.Element => {
  const {
    error,
    provider,
    setAccessModal,
    setError,
    setWalletName,
    walletName,
    zkWallet,
  } = useRootData(
    ({
      error,
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
  }, [createWallet, provider, setAccessModal, setWalletName, zkWallet]);

  useEffect(() => {
    if (provider && window['ethereum']) {
      window['ethereum'].autoRefreshOnNetworkChange = false;
      handleNetworkChange();
    }
    if (provider && walletName && walletName !== 'Fortmatic') {
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
    window,
    zkWallet,
  ]);

  const logout = useLogout();

  useEffect(() => {
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
        logout(true, 'Metamask');
      }
    });
  }, [logout, provider, setWalletName, walletName, zkWallet]);

  return (
    <div className={`content-wrapper ${walletName ? '' : 'start-page'}`}>
      <Modal
        cancelAction={() => setError('')}
        visible={!!error}
        classSpecifier='error'
        background={true}
      >
        <p>{error}</p>
      </Modal>
      {walletName && <Header />}
      <div className='content'>{children}</div>
      <Footer />
    </div>
  );
};

export default App;
