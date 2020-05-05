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
import { useObserver } from 'mobx-react-lite';
import { useStore } from './store/context';
import { autorun } from 'mobx';

const App: React.FC<IAppProps> = ({ children }) => {
  const store = useStore();

  useWSHeartBeat();
  const cancelable = useCancelable();
  const [curAddress, setCurAddress] = useState<string>(
    store.provider?.selectedAddress,
  );

  useEffect(() => {
    if (store.provider && store.walletName) {
      setCurAddress(store.provider.selectedAddress);
    }
    if (curAddress && store.walletName) {
      store.hintModal = `Login with ${store.walletName}`;
    }
  }, [curAddress, cancelable, store]);

  useInterval(() => {
    if (!curAddress && store.walletName && store.provider?.selectedAddress) {
      setCurAddress(store.provider?.selectedAddress);
    }
  }, 5000);

  // Listen for network change
  useEffect(() => {
    const provider = store.provider;
    const walletName = store.walletName;
    if (provider && walletName === 'Metamask') {
      window['ethereum'].autoRefreshOnNetworkChange = false;

      const networkChangeListener = () => {
        if (
          provider.networkVersion !== RIGHT_NETWORK_ID &&
          walletName === 'Metamask'
        ) {
          store.error = `Wrong network, please switch to the ${RIGHT_NETWORK_NAME}`;
        } else {
          store.error = '';
        }
      };

      networkChangeListener();
      provider.on('networkChanged', networkChangeListener);
      return () => provider.off('networkChanged', networkChangeListener);
    }
  }, [store]);

  const logout = useLogout();

  // Listen for account change
  useEffect(() => {
    const provider = store.provider;
    const walletName = store.walletName;

    if (store.zkWallet) {
      store.isAccessModalOpen = false;
    }
    if (!provider || walletName !== 'Metamask') return;
    const accountChangeListener = () => {
      if (
        store.zkWallet &&
        provider &&
        store.zkWalletAddress?.toLowerCase() !==
          provider.selectedAddress.toLowerCase()
      ) {
        sessionStorage.setItem('walletName', walletName);
        const savedWalletName = sessionStorage.getItem(
          'walletName',
        ) as WalletType;
        if (savedWalletName) {
          store.walletName = savedWalletName;
        }
        store.zkWallet = null;
        store.zkBalances = [];
        store.isAccessModalOpen = false;
        store.transactions = [];
      }
    };
    provider.on('accountsChanged', accountChangeListener);
    return () => provider.off('accountsChanged', accountChangeListener);
  }, [logout, store]);

  return useObserver(() => (
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
        visible={
          store.isAccessModalOpen &&
          window.location.pathname.length > 1 &&
          store.provider &&
          store.provider.networkVersion === RIGHT_NETWORK_ID
        }
        classSpecifier='metamask'
        background={true}
        centered
      >
        <p>{'Please make sign in the pop up'}</p>
      </Modal>
      {store.walletName && <Header />}
      <div className='content'>{children}</div>
      <Footer />
    </div>
  ));
};

export default App;
