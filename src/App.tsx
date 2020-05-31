import React, { useState, useEffect } from 'react';

import Footer from 'components/Footer/Footer';
import Header from 'components/Header/Header';
import Modal from 'components/Modal/Modal';

import { IAppProps } from 'types/Common';

import { RIGHT_NETWORK_ID, RIGHT_NETWORK_NAME } from 'constants/networks';
import { WRONG_NETWORK } from 'constants/regExs';
import { useWSHeartBeat } from 'hooks/useWSHeartbeat';
import { WalletType } from './constants/Wallets';
import { useInterval } from './hooks/timers';
import { observer } from 'mobx-react-lite';
import { useStore } from './store/context';
import { useMobxEffect } from './hooks/useMobxEffect';
import { useLocation } from 'react-router-dom';
import { getWalletNameFromProvider } from './utils';
import { useLogout } from 'hooks/useLogout';

const App: React.FC<IAppProps> = observer(({ children }) => {
  const store = useStore();
  const { pathname } = useLocation();

  const handleLogout = useLogout();

  useWSHeartBeat();
  const [curAddress, setCurAddress] = useState<string>(
    store.provider?.selectedAddress,
  );

  useMobxEffect(() => {
    if (store.provider && store.walletName) {
      setCurAddress(store.provider.selectedAddress);
    }
    if (curAddress && store.walletName) {
      store.hint = `Login with ${store.walletName}`;
    }
  });

  useInterval(() => {
    if (!curAddress && store.walletName && store.provider?.selectedAddress) {
      setCurAddress(store.provider?.selectedAddress);
    }
  }, 5000);

  useEffect(() => {
    if (store.zkWallet) {
      sessionStorage.setItem('walletName', store.walletName);
    } else if (!store.zkWallet && window.location.pathname.length > 1) {
      store.walletName = sessionStorage.getItem('walletName') as WalletType;
      store.normalBg = true;
      store.isAccessModalOpen = true;
    }
  }, [store.zkWallet]);

  useEffect(() => {
    if (!store.zkWallet && !store.isAccessModalOpen) {
      localStorage.removeItem('walletconnect');
    }
  }, [store.zkWallet, store.isAccessModalOpen]);
  // Listen for network change
  useMobxEffect(() => {
    const { provider } = store;
    if (provider && store.walletName === 'Metamask') {
      window['ethereum'].autoRefreshOnNetworkChange = false;
      const networkChangeListener = () => {
        if (
          provider.networkVersion !== RIGHT_NETWORK_ID &&
          store.walletName === 'Metamask'
        ) {
          store.error = `Wrong network, please switch to the ${RIGHT_NETWORK_NAME}`;
          store.isAccessModalOpen = false;
        } else {
          store.error = '';
          store.isAccessModalOpen = true;
        }
      };
      if (store.walletName === 'Metamask') {
        networkChangeListener();
        provider.on('networkChanged', networkChangeListener);
        return () => provider.off('networkChanged', networkChangeListener);
      }
    }
  }, [store.walletName, store]);

  // Listen for account change
  const { provider, walletName, zkWallet } = store;

  useEffect(() => {
    if (zkWallet) {
      store.isAccessModalOpen = false;
    }
    if (!provider && !walletName) return;
    const accountChangeListener = () => {
      if (
        zkWallet &&
        provider &&
        store.zkWalletAddress?.toLowerCase() !==
          provider.selectedAddress.toLowerCase() &&
        walletName === 'Metamask'
      ) {
        sessionStorage.setItem('walletName', walletName);
        const savedWalletName = sessionStorage.getItem(
          'walletName',
        ) as WalletType;
        store.walletName = 'Metamask';
        store.setBatch({
          zkWallet: null,
          zkBalances: [],
          isAccessModalOpen: true,
          transactions: [],
          zkWalletInitializing: false,
          searchBalances: [],
          searchContacts: [],
          ethBalances: [],
        });
      }
    };
    if (walletName === 'Metamask' && provider) {
      provider.on('accountsChanged', accountChangeListener);
      return () => provider.off('accountsChanged', accountChangeListener);
    }
  }, [provider, store, walletName, zkWallet, store.walletName]);

  useEffect(() => {
    const { zkWallet, provider, walletName } = store;
    if (provider && walletName) return;
    if (zkWallet || pathname === '/') return;
    store.setBatch({
      isAccessModalOpen: true,
      provider: window['ethereum'],
    });
  }, [pathname, store]);

  useMobxEffect(() => {
    if (
      store.modalSpecifier ||
      store.isAccessModalOpen ||
      store.transactionModal ||
      store.error
    ) {
      document.body.classList.add('fixed');
      return () => document.body.classList.remove('fixed');
    }
  });

  return (
    <div className={`content-wrapper ${store.walletName ? '' : 'start-page'}`}>
      <Modal
        cancelAction={() => {
          store.error = '';
        }}
        visible={!!store.error}
        classSpecifier='error'
        background={true}
        centered
      >
        <p>{store.error}</p>
      </Modal>
      <Modal
        cancelAction={() => {
          store.isAccessModalOpen = false;
        }}
        visible={store.isAccessModalOpen && !store.error}
        classSpecifier='metamask'
        background={true}
        centered
      >
        <p>{'Please make sign in the pop up'}</p>
      </Modal>
      {store.walletName && <Header />}
      <div className='content'>{children}</div>
      <div className='content-portal'></div>
      <Footer />
    </div>
  );
});

export default App;
