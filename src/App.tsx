import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import Footer from 'components/Footer/Footer';
import Header from 'components/Header/Header';
import Modal from 'components/Modal/Modal';
import Spinner from 'components/Spinner/Spinner';
import HintBody from 'src/components/Modal/HintBody';

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
import useWalletInit from 'src/hooks/useWalletInit';

const App: React.FC<IAppProps> = observer(({ children }) => {
  const store = useStore();
  const { pathname } = useLocation();
  const { createWallet } = useWalletInit();
  const history = useHistory();

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
      localStorage.setItem('walletName', store.walletName);
    } else if (!store.zkWallet && window.location.pathname.length > 1) {
      if (
        localStorage.getItem('walletName') ||
        sessionStorage.getItem('walletName')
      ) {
        store.walletName = localStorage.getItem('walletName')
          ? (localStorage.getItem('walletName') as WalletType)
          : (sessionStorage.getItem('walletName') as WalletType);
        store.normalBg = true;
        store.isAccessModalOpen = true;
      } else {
        handleLogout(false, '');
      }
    }
  }, [store.zkWallet, store.isAccessModalOpen]);

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

  const metaMaskConnected = store.hint?.match(/login/i);

  const info = store.hint.split('\n');

  const errorAppearence = () => (
    <>
      {store.hint && info && info[0].match(/(?:install)/i) && (
        <p>
          {info[0]}{' '}
          <a href={info[1]} target='_blank' rel='noopener noreferrer'>
            {'here'}
          </a>
        </p>
      )}
      {!store.error.match(/(?:detected)/i) && <p>{store.error}</p>}
    </>
  );

  const closeHandler = useCallback(() => {
    if (store.error.match(WRONG_NETWORK) && store.zkWallet) {
      return;
    } else {
      store.error = '';
      if (!store.zkWallet && !!store.walletName) {
        store.provider = null;
        store.walletName = '';
        store.isAccessModalOpen = false;
        store.zkWallet = null;
        history.push('/');
      }
    }
  }, [history, store]);

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
        <>
          {zkWallet && store.error && provider && (
            <button onClick={closeHandler} className='close-icon' />
          )}
          {!zkWallet && (
            <h3 className='title-connecting'>
              {!store.error.match(/(?:detected)/i) &&
                `${
                  store.error && store.hint && store.hint.match(/(?:login)/i)
                    ? store.hint
                    : 'Connecting to '
                } ${walletName}`}
              {store.error.match(/(?:detected)/i) && store.error}
            </h3>
          )}
          {provider &&
          provider.networkVersion !== RIGHT_NETWORK_ID &&
          store.walletName === 'Metamask' ? (
            <>
              <div
                className={`${walletName
                  .replace(/\s+/g, '')
                  .toLowerCase()}-logo`}
              ></div>
              <div className='wrong-network'>
                {provider &&
                walletName === 'Metamask' &&
                provider.networkVersion === RIGHT_NETWORK_ID ? null : (
                  <div className='wrong-network-logo'></div>
                )}
                {errorAppearence()}
              </div>
            </>
          ) : (
            errorAppearence()
          )}
          {!zkWallet && (
            <button
              className='btn submit-button'
              onClick={() => handleLogout(false, '')}
            >
              {`Disconnect ${walletName}`}
            </button>
          )}
        </>
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
        <>
          <h3 className='title-connecting'>
            {metaMaskConnected ? 'Connected to ' : 'Connecting to '}
            {walletName}
          </h3>
          <div
            className={`${walletName &&
              walletName.replace(/\s+/g, '').toLowerCase()}-logo`}
          ></div>
          {store.zkWalletInitializing && (
            <>
              <Spinner />
              <p className='modal-instructions'>
                {store.walletName !== 'Fortmatic' &&
                  store.walletName !== 'BurnerWallet' &&
                  'Follow the instructions in the pop up'}
              </p>
            </>
          )}
          {!store.zkWalletInitializing && (
            <button
              className='btn submit-button'
              onClick={() => createWallet()}
            >
              {`Login with ${walletName}`}
            </button>
          )}
          {store.walletName !== 'BurnerWallet' ||
            (store.walletName === 'BurnerWallet' &&
              !store.zkWalletInitializing && (
                <button
                  onClick={() => handleLogout(false, '')}
                  className='btn btn-cancel btn-tr '
                >
                  {store.zkWalletInitializing ? 'Close' : 'Cancel'}
                </button>
              ))}
        </>
      </Modal>
      <Modal
        cancelAction={() => {
          store.modalHintMessage = '';
          store.modalSpecifier = '';
        }}
        visible={false}
        classSpecifier='modal-hint'
        background={false}
        centered
      >
        <HintBody />
      </Modal>
      {store.walletName && <Header />}
      <div className='content'>{children}</div>
      <div className='content-portal'></div>
      <Footer />
    </div>
  );
});

export default App;
