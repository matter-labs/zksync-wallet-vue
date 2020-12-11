import React, { useCallback, useEffect, useMemo } from 'react';
import { Redirect } from 'react-router-dom';
import Web3 from 'web3';
import { observer } from 'mobx-react-lite';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ReactTooltip from 'react-tooltip';
import { fas } from '@fortawesome/free-solid-svg-icons';

import LazyWallet from 'components/Wallets/LazyWallet';

import { useQuery } from 'hooks/useQuery';

import { MOBILE_DEVICE } from 'constants/regExs';
import { WIDTH_BP } from 'constants/magicNumbers';
import { LINKS_CONFIG } from 'src/config';

import {
  portisConnector,
  walletConnectConnector,
} from 'src/components/Wallets/walletConnectors';

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

  const { connect, getSigner, createWallet } = useWalletInit();

  const providerWalletName = getWalletNameFromProvider();

  const filterWallets = (list: string[]) => {
    if (!!navigator['brave']) list.push(...BRAVE_NON_WORKING_WALLETS);
    return list;
  };

  const walletsWithWeb3 = () => {
    const _w = Object.keys(WALLETS);
    if (!!store.windowEthereumProvider?._metamask) {
      return _w.filter(el => el !== 'Web3');
    }
    if (!store.windowEthereumProvider?._metamask && !!window['web3']) {
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
      walletsWithWeb3().filter(el =>
        mobileCheck
          ? !filterWallets(detectAndroidPlatform()).includes(el)
          : !filterWallets(MOBILE_ONLY_WALLETS).includes(el),
      ),
    [mobileCheck, DESKTOP_ONLY_WALLETS],
  );

  useEffect(() => {
    if (!store.walletName && store.isPrimaryPage) {
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
      if (key === 'External') {
        return;
      }

      if (
              key === 'Web3' ||
              (key === 'Coinbase Wallet' && store.isMobileDevice)
      ) {
        store.zkWalletInitializing = true;
        const web3 = new Web3(window['web3']?.getDefaultProvider);
        store.windowEthereumProvider?.enable().then(() => {
          web3.eth.getAccounts(() => {
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
                store.windowEthereumProvider &&
                +store.windowEthereumProvider?.chainId === +LINKS_CONFIG.networkId
        ) {
          store.zkWalletInitializing = true;
          createWallet();
        } else if (!store.windowEthereumProvider?.chainId && !!isAndroid) {
          createWallet();
        }
      }
      if (key === 'Portis') {
        store.setBatch({
          walletName: key,
          normalBg: true,
          isAccessModalOpen: true,
        });
        if (!store.provider) {
          store.hint = 'Connecting to ';
        }
        portisConnector(store, connect, getSigner);
        store.hint = 'Connecting to ';
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
          const wCQRScanned = localStorage.getItem('walletconnect');
          if (!!wCQRScanned) {
            createWallet();
          } else {
            walletConnectConnector(store, connect);
          }
        } else {
          store.setBatch({
            walletName: key,
            normalBg: true,
          });
          store.hint = 'Connecting to ';
          if (!store.isExternalWallet) {
            store.isAccessModalOpen = true;
          }
        }
        if (store.provider?.selectedAddress) {
          store.zkWalletInitializing = true;
        }
      }
      else {
        store.error = `Your browser doesn't support ${key}, please select another wallet or switch browser`;
      }
    },
    [store, wallets, store.ethId],
  );

  const { walletName, provider, hint } = store;
  if (store.zkWallet) {
    if (store.isExternalWallet) {
      return <Redirect to={`/${params.get('redirect') || 'withdraw'}`} />;
    } else {
      return <Redirect to={`/${params.get('redirect') || 'account'}`} />;
    }
  }

  return (
    <>
      <LazyWallet />
      {(!store.normalBg || !store.walletName) && (
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
              <button
                key={key}
                onClick={selectWallet(key as WalletType)}
                className={`wallet-block ${key}-block ${
                  key === 'External' ? store.ExternalWallerAfterClick : ''
                }`}
                data-event={`click ${
                  store.ExternalWallerAfterClick ? 'hover' : ''
                }`}
                data-tip={key === 'External'}
                data-for={key === 'External' ? 'ExternalTooltip' : ''}
              >
                <div className={`btn wallet-button ${key}`} key={key}>
                  {key === 'Web3' && (
                    <FontAwesomeIcon icon={['fas', 'globe']} />
                  )}
                </div>
                <p>{key}</p>
                {key === 'External' && (
                  <ReactTooltip
                    id='ExternalTooltip'
                    delayHide={500}
                    delayShow={200}
                    delayUpdate={200}
                    clickable={true}
                    afterShow={() => {
                      store.ExternalWallerAfterClick = 'externalClicked';
                    }}
                    border={false}
                    type={store.darkMode ? 'dark' : 'light'}
                    place='right'
                    effect='solid'
                    className='additionalTooltip'
                  >
                    <h3>
                      <strong>{'Better'}</strong> {'External Wallet'}
                    </h3>
                    <span className='description'>
                      {
                        'External Wallet functionality is under reconstruction in order to improve your experience.'
                      }
                    </span>
                    <a
                      className='expandTooltip'
                      onMouseDown={() => {
                        store.ExternalWallerShowWithdraw = !store.ExternalWallerShowWithdraw;
                      }}
                    >
                      {'Contact us to withdraw funds'}
                    </a>
                    <div
                      className={`withdrawBlock ${
                        store.ExternalWallerShowWithdraw ? 'showBlock' : ''
                      }`}
                    >
                      <span className='withdrawConditions'>
                        {
                          'Until the release we’ll serve withdrawals 7 days a week from 10 a.m. till 7p.m.'
                        }
                      </span>
                      <ul>
                        <li>
                          <a
                            href='https://twitter.com/the_matter_labs'
                            target='_blank'
                            className='twitterWithdraw'
                          >
                            {'DM us on twitter'}
                          </a>
                        </li>
                        <li>
                          <a
                            href='https://discord.gg/px2aR7w'
                            target='_blank'
                            className='discordWithdraw'
                          >
                            {'Use Discord'}
                          </a>
                        </li>
                        <li>
                          <a
                            href='mailto:hello@matter-labs.io'
                            target='_blank'
                            className='emailWithdraw'
                          >
                            {'mail to hello@matter-labs.io'}
                          </a>
                        </li>
                      </ul>
                    </div>
                  </ReactTooltip>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
});

export default PrimaryPage;
