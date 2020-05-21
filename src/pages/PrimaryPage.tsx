import React, { useMemo, useCallback } from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import Web3 from 'web3';
import { observer } from 'mobx-react-lite';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';

import LazyWallet from 'components/Wallets/LazyWallet';
import Modal from 'components/Modal/Modal';
import Spinner from 'components/Spinner/Spinner';

import { useQuery } from 'hooks/useQuery';

import { MOBILE_DEVICE } from 'constants/regExs';
import { RIGHT_NETWORK_ID } from 'constants/networks';
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
  const { pathname } = useLocation();
  const mobileCheck = useMemo(
    () => MOBILE_DEVICE.test(navigator.userAgent),
    [],
  );

  library.add(fas);

  const { createWallet } = useWalletInit();

  const providerWalletName = getWalletNameFromProvider();

  const filterWallets = (list: string[]) => {
    if (!!navigator['brave']) list.push(...BRAVE_NON_WORKING_WALLETS);
    return list;
  };

  const wallets = useMemo(
    () =>
      Object.keys(WALLETS).filter(el =>
        mobileCheck
          ? !filterWallets(DESKTOP_ONLY_WALLETS).includes(el)
          : !filterWallets(MOBILE_ONLY_WALLETS).includes(el),
      ),
    [mobileCheck],
  );

  const walletsWithInjected = () => {
    const _w = Object.keys(WALLETS);
    if (!!window['web3'] && !providerWalletName) {
      return _w.filter(el => el !== 'Metamask');
    } else {
      return _w.filter(el => el !== 'Injected');
    }
  };

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

  const selectWallet = useCallback(
    (key: WalletType) => () => {
      if (key === 'Injected') {
        store.zkWalletInitializing = true;
        const web3 = new Web3(window['web3'].getDefaultProvider);
        window['ethereum'].enable().then(() => {
          web3.eth.getAccounts((error, accounts) => {
            console.log(accounts);
            createWallet();
          });
        });
      }

      if (wallets.includes(key)) {
        if (key === 'WalletConnect') {
          store.modalSpecifier = 'wc';
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
      <>
        <Modal
          background={false}
          classSpecifier={`metamask ${
            store.walletName
              ? store.walletName.replace(/\s+/g, '').toLowerCase()
              : 'primary-page'
          }`}
          visible={store.isAccessModalOpen}
          cancelAction={() => handleLogOut(false, '')}
          centered
        >
          <div
            className={`${walletName.replace(/\s+/g, '').toLowerCase()}-logo`}
          ></div>
          {(provider && walletName !== 'Metamask') ||
          (provider &&
            walletName === 'Metamask' &&
            provider.networkVersion === RIGHT_NETWORK_ID) ? ( //TODO: need to change on prod
            <>
              <h3 className='title-connecting'>
                {!!hint && hint.match(/(?:login)/i) ? hint : 'Connecting to '}
              </h3>
              <p>{'Follow the instructions in the popup'}</p>
              <Spinner />
            </>
          ) : null}
        </Modal>
        <Modal
          background={false}
          classSpecifier={'wc'}
          visible={false}
          cancelAction={() => handleLogOut(false, '')}
          centered
        >
          <h3 className='title-connecting'>
            {'WalletConnect support will be enabled soon'}
          </h3>
          <button
            className='btn submit-button'
            onClick={() => handleLogOut(false, '')}
          >
            {'OK'}
          </button>
        </Modal>
        {!walletName && (
          <>
            <div className='beta-container'>
              <div className='logo-textless'></div>
              <p className='beta-text'>{'ALPHA'}</p>
            </div>
            <div className='welcome-text'>
              <h2>{'Simple, fast and secure token transfers'}</h2>
              <p>{'Connect a wallet'}</p>
            </div>
            <div className='wallets-wrapper'>
              {Object.values(walletsWithInjected()).map(key => (
                <button key={key} className='wallet-block'>
                  <div
                    className={`btn wallet-button ${key}`}
                    key={key}
                    onClick={selectWallet(key as WalletType)}
                  >
                    {key === 'Injected' && (
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
    </>
  );
});

export default PrimaryPage;
