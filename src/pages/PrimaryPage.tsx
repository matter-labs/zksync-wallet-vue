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

import {
  BRAVE_NON_WORKING_WALLETS,
  DESKTOP_ONLY_WALLETS,
  MOBILE_ONLY_WALLETS,
  WALLETS,
  WalletType,
} from 'constants/Wallets';
import { useLogout } from 'src/hooks/useLogout';
import { useStore } from 'src/store/context';
import useWalletInit from 'src/hooks/useWalletInit';
import { useMobxEffect } from 'src/hooks/useMobxEffect';
import { getWalletNameFromProvider } from '../utils';

const PrimaryPage: React.FC = observer(() => {
  const store = useStore();
  const handleLogOut = useLogout();
  const mobileCheck = useMemo(
    () =>
      MOBILE_DEVICE.test(navigator.userAgent) || window?.innerWidth < WIDTH_BP,
    [],
  );

  library.add(fas);

  const { createWallet } = useWalletInit();

  const providerWalletName = getWalletNameFromProvider();

  const filterWallets = (list: string[]) => {
    if (!!navigator['brave']) list.push(...BRAVE_NON_WORKING_WALLETS);
    return list;
  };

  const walletsWithWeb3 = () => {
    const _w = Object.keys(WALLETS);
    if (
      (!!window['web3'] && !providerWalletName) ||
      (!!window['web3'] && providerWalletName !== 'Metamask')
    ) {
      return _w.filter(el => el !== 'Metamask');
    } else {
      return _w.filter(el => el !== 'Web3');
    }
  };

  const wallets = useMemo(
    () =>
      walletsWithWeb3().filter(el =>
        mobileCheck
          ? !filterWallets(DESKTOP_ONLY_WALLETS).includes(el)
          : !filterWallets(MOBILE_ONLY_WALLETS).includes(el),
      ),
    [mobileCheck],
  );

  useMobxEffect(() => {
    const { provider, walletName } = store;
    if (!(provider && walletName === 'Metamask')) return;
    const listener = () => {
      store.isAccessModalOpen = true;
      store.walletName = 'Metamask';
    };
    if (store.walletName === 'Metamask') {
      store.provider.on('networkChanged', listener);
      return () => store.provider.off('networkChanged', listener);
    }
  });

  useEffect(() => {
    if (!store.walletName && window.location.pathname.length === 1) {
      store.isAccessModalOpen = false;
    }
  }, [store.zkWallet, store.walletName, store.isAccessModalOpen]);

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
        if (window['ethereum'].selectedAddress) {
          store.zkWalletInitializing = true;
          createWallet();
        }
      }
      if (wallets.includes(key)) {
        if (key === 'WalletConnect') {
          // store.modalSpecifier = 'wc';
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
    [store, wallets],
  );

  const params = useQuery();

  const { walletName, provider, hint } = store;
  if (store.zkWallet) {
    return <Redirect to={`/${params.get('redirect') || 'account'}`} />;
  }

  return (
    <>
      <LazyWallet />
      {!walletName && (
        <>
          <div className='beta-container'>
            <div className='logo-textless'></div>
            <p className='beta-text'>{'ALPHA'}</p>
          </div>
          <div className='welcome-text'>
            <h2>{'Simple, fast and secure value transfers'}</h2>
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
