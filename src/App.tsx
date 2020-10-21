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
import { useInterval, useTimeout } from './hooks/timers';
import { observer } from 'mobx-react-lite';
import { useStore } from './store/context';
import { useMobxEffect } from './hooks/useMobxEffect';
import { useLocation } from 'react-router-dom';
import { useLogout } from 'hooks/useLogout';
import useWalletInit from 'src/hooks/useWalletInit';
import {
  LINKS_CONFIG,
  RIGHT_NETWORK_NAME,
  AUTOLOGIN_WALLETS,
} from 'src/config';
import { checkForEmptyBalance, handleUnlinkAccount } from 'src/utils';
import {
  coinBaseConnector,
  browserWalletConnector,
  portisConnector,
  fortmaticConnector,
} from 'src/components/Wallets/walletConnectors';

const App: React.FC<IAppProps> = observer(({ children }) => {
  const store = useStore();
  const { AccountStore, TransactionStore } = store;
  const { pathname } = useLocation();
  const { createWallet, connect, getSigner } = useWalletInit();
  const history = useHistory();

  const handleLogout = useLogout();
  useWSHeartBeat();
  const [curAddress, setCurAddress] = useState<string>();

  const wrongNetworkDetector = () => {
    if (store.doesMetamaskUsesNewEthereumAPI) {
      return (
        provider?.chainId !== undefined &&
        +provider.chainId !== +LINKS_CONFIG.networkId
      );
    }
    return provider?.networkVersion !== LINKS_CONFIG.networkId;
  };

  useEffect(() => {
    if (store.provider && store.walletName) {
      if (store.isMetamaskWallet && store.doesMetamaskUsesNewEthereumAPI) {
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
      if (store.isMetamaskWallet && store.doesMetamaskUsesNewEthereumAPI) {
        store.provider
          ?.request({ method: 'eth_accounts' })
          .then(res => setCurAddress(res[0]));
      } else {
        store.provider?.selectedAddress;
      }
    }
  }, 5000);

  const savedWalletExistsOnLogin =
    !store.zkWallet &&
    !store.isPrimaryPage &&
    (window.localStorage?.getItem('walletName') ||
      sessionStorage.getItem('walletName'));

  const savedDoesNotExistOnLogin =
    !store.isPrimaryPage &&
    !(
      window.localStorage?.getItem('walletName') ||
      sessionStorage.getItem('walletName')
    );

  const savedWalletName =
    window.localStorage?.getItem('walletName') ||
    sessionStorage.getItem('walletName');

  const imidiateLoginCondition: boolean =
    store.isPrimaryPage &&
    sessionStorage.getItem('autoLoginStatus') !== 'changeWallet' &&
    AUTOLOGIN_WALLETS.includes(savedWalletName ?? '');

  // Listen for account change
  const { provider, walletName, zkWallet } = store;

  useEffect(() => {
    if (zkWallet) {
      store.isAccessModalOpen = false;
    }
    if (!provider && !walletName) return;
    const accountChangeListener = async () => {
      const newAddress = await store.windowEthereumProvider?.request({
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
        AccountStore.accountChanging = true;
        store.setBatch({
          hint: '',
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
          tokenInUnlockingProgress: [],
        });
        store.isAccessModalOpen = true;
        TransactionStore.isBalancesListOpen = false;
        TransactionStore.isContactsListOpen = false;
        TransactionStore.symbolName = '';
        TransactionStore.maxValue = 0;
        AccountStore.isAccountUnlockingProcess = false;
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
    if (store.zkWallet) {
      sessionStorage.setItem('walletName', store.walletName);
      window.localStorage?.setItem('walletName', store.walletName);
    }
    if (savedWalletExistsOnLogin && !AccountStore.accountChanging) {
      store.walletName = window.localStorage?.getItem('walletName')
        ? (window.localStorage?.getItem('walletName') as WalletType)
        : (sessionStorage.getItem('walletName') as WalletType);
      store.normalBg = true;
      store.isAccessModalOpen = true;
      store.hint = 'Connecting to ';
    }
    if (savedDoesNotExistOnLogin) {
      handleLogout(false, '');
      sessionStorage.setItem('autoLoginStatus', 'autoLogin');
    }
    if (
      !store.zkWallet &&
      savedWalletName &&
      !AccountStore.accountChanging &&
      (!store.isPrimaryPage || imidiateLoginCondition)
    ) {
      if (store.autoLoginRequestStatus !== 'changeWallet') {
        sessionStorage.setItem('autoLoginStatus', 'autoLogin');
      }
      store.walletName = savedWalletName as WalletType;
      store.normalBg = true;
      store.isAccessModalOpen = true;
      store.hint = 'Connecting to ';
      const wCQRScanned = localStorage.getItem('walletconnect');
      if (!!AccountStore.accountChanging) return;
      if (store.isBurnerWallet) {
        createWallet();
      }
      store.zkWalletInitializing = false;
      /* Need to save for the possible future bugs  **/
      // if (store.isWalletConnect && (!store.isPrimaryPage || wCQRScanned)) {
      //   createWallet();
      // }
      // if (store.isPortisWallet) {
      //   portisConnector(store, connect, getSigner);
      // }
    }
    if (!store.isPrimaryPage && !savedWalletName) {
      handleLogout(false, '');
    }
  }, [store.zkWallet, store.autoLoginRequestStatus]);

  /* Need to save for the possible future bugs  **/
  // useEffect(() => {
  //   if (!store.zkWallet && !store.isAccessModalOpen) {
  //     window.localStorage?.removeItem('walletconnect');
  //   }
  // }, [store.zkWallet, store.isAccessModalOpen]);

  useEffect(() => {
    if (!store.isCoinbaseWallet && store.isPrimaryPage) return;
    store.isMobileDevice
      ? (browserWalletConnector(store, connect),
        (store.zkWalletInitializing = false))
      : coinBaseConnector(store, connect);
  }, [store, store.walletName]);

  useEffect(() => {
    if (!store.isFortmaticWallet && store.isPrimaryPage) return;
    fortmaticConnector(store, connect, getSigner, true);
  }, [store, store.walletName]);

  useEffect(() => {
    if (!store.isPortisWallet && store.isPrimaryPage) return;
    portisConnector(store, connect, getSigner, true);
  }, [store, store.walletName]);

  // Listen for network change
  useMobxEffect(() => {
    const { provider } = store;
    if (provider && store.isMetamaskWallet) {
      store.windowEthereumProvider.autoRefreshOnNetworkChange = false;
      const networkChangeListener = () => {
        if (wrongNetworkDetector() && store.isMetamaskWallet) {
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
        if (store.doesMetamaskUsesNewEthereumAPI) {
          provider.on('chainChanged', networkChangeListener);
          return () => provider.off('chainChanged', networkChangeListener);
        } else {
          provider.on('networkChanged', networkChangeListener);
          return () => provider.off('networkChanged', networkChangeListener);
        }
      }
    }
  }, [
    store.walletName,
    store.isMetamaskWallet,
    store.provider,
    store.doesMetamaskUsesNewEthereumAPI,
    store,
  ]);

  useEffect(() => {
    if (wrongNetworkDetector() && store.isMetamaskWallet) {
      store.error = `Wrong network, please switch to the ${RIGHT_NETWORK_NAME}`;
      store.isAccessModalOpen = false;
      store.zkWalletInitializing = false;
    } else {
      store.error = '';
      if (store.walletName && !AccountStore.accountChanging) {
        store.isAccessModalOpen = true;
      }
    }
  }, [store.walletName, store.isMetamaskWallet, provider]);

  useEffect(() => {
    if (!store.walletName || store.isExternalWallet) {
      history.push('/');
      store.isAccessModalOpen = false;
    }
  }, [store.walletName]);

  useEffect(() => {
    checkForEmptyBalance(store, store.zkBalances);
  }, [store.zkBalances, store]);

  useEffect(() => {
    const { zkWallet, provider, walletName } = store;
    if (provider && walletName) return;
    if (zkWallet || pathname === '/') return;
    store.setBatch({
      isAccessModalOpen: true,
      provider: store.windowEthereumProvider,
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

  useEffect(() => {
    if (!store.zkWallet) return;
    AccountStore.accountChanging = false;
  }, [store.zkWallet]);

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

  const handleOpenUnlinkModal = () => {
    store.modalHintMessage = `Unlink${store.walletName}`;
    store.modalSpecifier = 'modal-hint';
  };

  const UnlinkAcccountBtn = () => (
    <span onClick={() => handleUnlinkAccount(store)} className='undo-btn block'>
      {'Unlink account'}
    </span>
  );

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
          {wrongNetworkDetector() && store.isMetamaskWallet ? (
            <>
              <div
                className={`${walletName
                  .replace(/\s+/g, '')
                  .toLowerCase()}-logo`}
              ></div>
              <div className='wrong-network'>
                {store.isMetamaskWallet && wrongNetworkDetector() ? null : (
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
            {store.isMetamaskWallet ||
            store.isWalletConnect ||
            store.isPortisWallet ||
            store.isFortmaticWallet ||
            store.isCoinbaseWallet
              ? store.hint
              : 'Connecting to '}
            {walletName}
          </h3>
          <p className='name'>{store.AccountStore.accountAddress}</p>
          <div
            className={`${walletName &&
              walletName.replace(/\s+/g, '').toLowerCase()}-logo`}
          ></div>
          {store.zkWalletInitializing && (
            <>
              <Spinner />
              <p className='modal-instructions'>
                {!store.isFortmaticWallet &&
                  !store.isBurnerWallet &&
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
          {(store.isCoinbaseWallet ||
            store.isWalletConnect ||
            store.isFortmaticWallet ||
            store.isPortisWallet) && <UnlinkAcccountBtn />}
          {(!store.isBurnerWallet ||
            (store.isBurnerWallet && !store.zkWalletInitializing)) && (
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
      {store.normalBg && store.walletName && <Header />}
      <div className='content'>{children}</div>
      <div className='content-portal'></div>
      <Footer />
    </div>
  );
});

export default App;
