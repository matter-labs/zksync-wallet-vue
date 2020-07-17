import React, { useMemo, useCallback, useEffect } from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import Web3 from 'web3';
import { observer } from 'mobx-react-lite';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';

import LazyWallet from 'components/Wallets/LazyWallet';

import { useQuery } from 'hooks/useQuery';

import { MOBILE_DEVICE } from 'constants/regExs';
import { WIDTH_BP } from 'constants/magicNumbers';
import { LINKS_CONFIG } from 'src/config';

import {
  BRAVE_NON_WORKING_WALLETS,
  DESKTOP_ONLY_WALLETS,
  MOBILE_ONLY_WALLETS,
  WALLETS,
  WalletType,
} from 'constants/Wallets';
import { useStore } from 'src/store/context';
import useWalletInit from 'src/hooks/useWalletInit';
import { getWalletNameFromProvider } from '../utils';

const PrimaryPage: React.FC = observer(() => {
  const store = useStore();
  const mobileCheck = useMemo(
    () =>
      MOBILE_DEVICE.test(navigator.userAgent) || window?.innerWidth < WIDTH_BP,
    [],
  );

  const params = useQuery();
  const wcMainSessionStorageFlag = 'wcMain';

  library.add(fas);

  const { createWallet } = useWalletInit();

  const providerWalletName = getWalletNameFromProvider();

  const filterWallets = (list: string[]) => {
    if (!!navigator['brave']) list.push(...BRAVE_NON_WORKING_WALLETS);
    return list;
  };

  const walletsWithWeb3 = () => {
    const _w = Object.keys(WALLETS);
    if (!!window['ethereum']?._metamask) {
      return _w.filter(el => el !== 'Web3');
    }
    if (!window['ethereum']?._metamask && !!window['web3']) {
      return _w.filter(el => el !== 'Metamask');
    } else {
      return _w.filter(el => el !== 'Metamask' && el !== 'Web3');
    }
  };

  const isAndroid = /(android)/i.test(navigator.userAgent);

  const detectAndroidPlatform = () => {
    const indexOfMetamask = DESKTOP_ONLY_WALLETS.indexOf('Metamask');
    if (isAndroid && !!window['web3']) {
      DESKTOP_ONLY_WALLETS.splice(indexOfMetamask, 1);
    }
    return DESKTOP_ONLY_WALLETS;
  };

  const wallets = useMemo(
    () =>
      walletsWithWeb3()
        .filter(el =>
          mobileCheck
            ? !filterWallets(detectAndroidPlatform()).includes(el)
            : !filterWallets(MOBILE_ONLY_WALLETS).includes(el),
        )
        .concat(['Other']),
    [mobileCheck, DESKTOP_ONLY_WALLETS],
  );

  useEffect(() => {
    if (!store.walletName && window.location.pathname.length === 1) {
      store.isAccessModalOpen = false;
    }
  }, [store.zkWallet, store.walletName, store.isAccessModalOpen]);

  useEffect(() => {
    sessionStorage.setItem(wcMainSessionStorageFlag, 'true');
  }, [store.zkWallet, store.isAccessModalOpen]);

  const WCEnabledParams = params.get('wc');
  const WCEnabledSession = sessionStorage.getItem(wcMainSessionStorageFlag);

  const selectWallet = useCallback(
    (key: WalletType) => () => {
      if (key === 'Web3') {
        store.zkWalletInitializing = true;
        const web3 = new Web3(window['web3'].getDefaultProvider);
        window['ethereum'].enable().then(() => {
          web3.eth.getAccounts((error, accounts) => {
            console.log(accounts);
            createWallet();
          });
        });
      }
      if (key === 'Other') {
        store.modalHintMessage = 'OtherWallets';
        store.modalSpecifier = 'modal-hint';
      }
      if (key === 'BurnerWallet') {
        store.setBatch({
          walletName: key,
          normalBg: true,
          isAccessModalOpen: true,
          zkWalletInitializing: true,
        });
        createWallet();
      }
      if (key === 'Metamask') {
        store.setBatch({
          walletName: key,
          normalBg: true,
          isAccessModalOpen: true,
        });
        if (!store.provider) {
          store.hint = 'Connecting to ';
        }
        if (
          window['ethereum'] &&
          +window['ethereum'].chainId === +LINKS_CONFIG.networkId
        ) {
          store.zkWalletInitializing = true;
          createWallet();
        } else if (!window['ethereum'].chainId && !!isAndroid) {
          createWallet();
        }
      }
      if (wallets.includes(key)) {
        if (key === 'Other') return;
        if (key === 'WalletConnect') {
          if (!store.provider) {
            store.hint = 'Connecting to ';
          }
          store.setBatch({
            walletName: key,
            normalBg: true,
            isAccessModalOpen: true,
          });
        } else {
          store.setBatch({
            walletName: key,
            normalBg: true,
            isAccessModalOpen: true,
          });
        }
        if (store.provider?.selectedAddress) {
          store.zkWalletInitializing = true;
        }
      } else {
        store.error = `Your browser doesn't support ${key}, please select another wallet or switch browser`;
      }
    },
    [store, wallets, store.ethId],
  );

  const { walletName, provider, hint } = store;
  if (store.zkWallet) {
    return <Redirect to={`/${params.get('redirect') || 'account'}`} />;
  }

  return (
    <>
      <LazyWallet />
      {!walletName && (
        <>
          <a href='//zksync.io' target='_blank' rel='noopener noreferrer'>
            <div className='beta-container'>
              <div className='logo-textless'></div>
              <p className='beta-text'>{'BETA'}</p>
            </div>
          </a>
          <div className='welcome-text'>
            <h2>{'Trustless, scalable crypto payments'}</h2>
            <p>{'Connect a wallet'}</p>
          </div>
          <div className='wallets-wrapper'>
            {Object.values(wallets).map(key => (
              <button key={key} className='wallet-block'>
                <div
                  className={`btn wallet-button ${key}`}
                  key={key}
                  onClick={selectWallet(key as WalletType)}
                >
                  {key === 'Web3' && (
                    <FontAwesomeIcon icon={['fas', 'globe']} />
                  )}
                </div>
                <p>{key}</p>
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
});

export default PrimaryPage;
