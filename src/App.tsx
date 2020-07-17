import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import Footer from 'components/Footer/Footer';
import Header from 'components/Header/Header';
import Modal from 'components/Modal/Modal';
import Spinner from 'components/Spinner/Spinner';
import HintBody from 'src/components/Modal/HintBody';

import { IAppProps } from 'types/Common';

import { WRONG_NETWORK } from 'constants/regExs';
import { useWSHeartBeat } from 'hooks/useWSHeartbeat';
import { WalletType } from './constants/Wallets';
import { useInterval } from './hooks/timers';
import { observer } from 'mobx-react-lite';
import { useStore } from './store/context';
import { useMobxEffect } from './hooks/useMobxEffect';
import { useLocation } from 'react-router-dom';
import { useLogout } from 'hooks/useLogout';
import useWalletInit from 'src/hooks/useWalletInit';
import { LINKS_CONFIG, RIGHT_NETWORK_NAME } from 'src/config';
import { checkForEmptyBalance } from 'src/utils';

const App: React.FC<IAppProps> = observer(({ children }) => {
  const store = useStore();
  const { pathname } = useLocation();
  const { createWallet } = useWalletInit();
  const history = useHistory();

  const handleLogout = useLogout();
  useWSHeartBeat();
  const [curAddress, setCurAddress] = useState<string>();

  useEffect(() => {
    if (store.provider && store.walletName) {
      if (store.isMetamaskWallet) {
        store.provider
          ?.request({ method: 'eth_accounts' })
          .then(res => setCurAddress(res[0]));
      } else {
        setCurAddress(store.provider.selectedAddress);
      }
    }
    if (curAddress && store.walletName) {
      store.hint = `Login with ${store.walletName}`;
    }
  }, []);

  useInterval(() => {
    if (!curAddress && store.walletName && store.provider) {
      if (store.isMetamaskWallet) {
        store.provider
          ?.request({ method: 'eth_accounts' })
          .then(res => setCurAddress(res[0]));
      } else {
        store.provider?.selectedAddress;
      }
    }
  }, 5000);

  useEffect(() => {
    if (store.zkWallet) {
      sessionStorage.setItem('walletName', store.walletName);
      window.localStorage?.setItem('walletName', store.walletName);
    } else if (!store.zkWallet && window.location.pathname.length > 1) {
      if (
        window.localStorage?.getItem('walletName') ||
        sessionStorage.getItem('walletName')
      ) {
        store.walletName = window.localStorage?.getItem('walletName')
          ? (window.localStorage?.getItem('walletName') as WalletType)
          : (sessionStorage.getItem('walletName') as WalletType);
        store.normalBg = true;
        store.isAccessModalOpen = true;
        if (store.isMetamaskWallet || store.walletName === 'WalletConnect') {
          store.hint = 'Connecting to ';
        }
      } else {
        handleLogout(false, '');
      }
    }
  }, [store.zkWallet, store.isAccessModalOpen]);

  useEffect(() => {
    if (!store.zkWallet && !store.isAccessModalOpen) {
      window.localStorage?.removeItem('walletconnect');
    }
  }, [store.zkWallet, store.isAccessModalOpen]);
  // Listen for network change
  useMobxEffect(() => {
    const { provider } = store;
    if (provider && store.isMetamaskWallet) {
      window['ethereum'].autoRefreshOnNetworkChange = false;
      const networkChangeListener = () => {
        if (
          provider?.chainId !== undefined &&
          +provider.chainId !== +LINKS_CONFIG.networkId &&
          store.isMetamaskWallet
        ) {
          store.error = `Wrong network, please switch to the ${RIGHT_NETWORK_NAME}`;
          store.isAccessModalOpen = false;
          store.zkWalletInitializing = false;
        } else {
          store.error = '';
          if (!store.zkWallet) {
            store.isAccessModalOpen = true;
            store.zkWalletInitializing = false;
          }
        }
      };
      if (store.isMetamaskWallet) {
        provider.on('chainChanged', networkChangeListener);
        return () => provider.off('chainChanged', networkChangeListener);
      }
    }
  }, [store.walletName, store.isMetamaskWallet, store.provider, store]);

  // Listen for account change
  const { provider, walletName, zkWallet } = store;

  useEffect(() => {
    if (
      provider?.chainId !== undefined &&
      +provider.chainId !== +LINKS_CONFIG.networkId &&
      store.isMetamaskWallet
    ) {
      store.error = `Wrong network, please switch to the ${RIGHT_NETWORK_NAME}`;
      store.isAccessModalOpen = false;
      store.zkWalletInitializing = false;
    } else {
      store.error = '';
    }
  }, [store.walletName, store.isMetamaskWallet, provider]);

  useEffect(() => {
    if (zkWallet) {
      store.isAccessModalOpen = false;
    }
    if (!provider && !walletName) return;
    const accountChangeListener = async () => {
      const newAddress = await window['ethereum']?.request({
        method: 'eth_accounts',
      });
      setCurAddress(newAddress[0]);
      if (
        zkWallet &&
        provider &&
        store.zkWallet?.address().toLowerCase() !==
          newAddress[0]?.toLowerCase() &&
        store.isMetamaskWallet
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
          isAccountBalanceLoading: true,
          isAccountBalanceNotEmpty: false,
        });
      }
    };
    if (store.isMetamaskWallet && provider) {
      provider.on('accountsChanged', accountChangeListener);
      return () => provider.off('accountsChanged', accountChangeListener);
    }
  }, [
    provider,
    store,
    walletName,
    zkWallet,
    store.walletName,
    store.isMetamaskWallet,
    setCurAddress,
    curAddress,
  ]);

  useEffect(() => {
    checkForEmptyBalance(store, store.zkBalances);
  }, [store.zkBalances, store]);

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
      {<p>{store.error}</p>}
    </>
  );

  const closeHandler = useCallback(() => {
    if (store.error.match(WRONG_NETWORK) && store.zkWallet) {
      handleLogout(false, '');
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

  useEffect(() => {
    if (store.modalSpecifier !== 'claim-tokens') {
      store.MLTTclaimed = false;
    }
  }, [store.modalSpecifier, store.MLTTclaimed]);

  return (
    <div className={`content-wrapper ${store.walletName ? '' : 'start-page'}`}>
      <Modal
        cancelAction={() => {
          store.error = '';
        }}
        visible={
          !!store.error && !store.error.match(/closed/i) && !!store.walletName
        }
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
              {!store.error?.match(/(?:detected)/i) &&
                `${
                  store.error && store.hint && store.hint.match(/(?:login)/i)
                    ? store.hint
                    : 'Connecting to '
                } ${walletName}`}
              {store.error?.match(/(?:detected)/i) && store.error}
            </h3>
          )}
          {+provider?.chainId !== +LINKS_CONFIG.networkId &&
          store.isMetamaskWallet ? (
            <>
              <div
                className={`${walletName
                  .replace(/\s+/g, '')
                  .toLowerCase()}-logo`}
              ></div>
              <div className='wrong-network'>
                {store.isMetamaskWallet &&
                +provider?.chainId === +LINKS_CONFIG.networkId ? null : (
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
            {store.isMetamaskWallet || store.walletName === 'WalletConnect'
              ? store.hint
              : 'Connecting to '}
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
              className='btn submit-button margin'
              onClick={() => createWallet()}
            >
              {'Login'}
            </button>
          )}
          {(store.walletName !== 'BurnerWallet' ||
            (store.walletName === 'BurnerWallet' &&
              !store.zkWalletInitializing)) && (
            <button
              onClick={() => handleLogout(false, '')}
              className='btn btn-cancel btn-tr '
            >
              {store.zkWalletInitializing ? 'Close' : 'Cancel'}
            </button>
          )}
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
