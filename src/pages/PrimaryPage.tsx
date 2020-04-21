import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Redirect, useHistory } from 'react-router-dom';

import LazyWallet from 'components/Wallets/LazyWallet';
import Modal from 'components/Modal/Modal';
import Spinner from 'components/Spinner/Spinner';

import { useRootData } from 'hooks/useRootData';
import useWalletInit from 'hooks/useWalletInit';
import { useInterval, useTimeout } from 'hooks/timers';
import { useQuery } from 'hooks/useQuery';
import { useCancelable } from 'hooks/useCancelable';

import { MOBILE_DEVICE } from 'constants/regExs';
import { RIGHT_NETWORK_ID, RIGHT_NETWORK_NAME } from 'constants/networks';
import {
  BRAVE_NON_WORKING_WALLETS,
  DESKTOP_ONLY_WALLETS,
  MOBILE_ONLY_WALLETS,
  WALLETS,
  WalletType,
} from 'constants/Wallets';
import { useLogout } from 'src/hooks/useLogout';

const PrimaryPage: React.FC = (): JSX.Element => {
  const { createWallet } = useWalletInit();

  const mobileCheck = useMemo(
    () => MOBILE_DEVICE.test(navigator.userAgent),
    [],
  );
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

  const {
    error,
    hintModal,
    isAccessModalOpen,
    provider,
    setAccessModal,
    setError,
    setHintModal,
    setNormalBg,
    setProvider,
    setWalletName,
    setZkWallet,
    walletName,
    zkWallet,
  } = useRootData(
    ({
      error,
      hintModal,
      isAccessModalOpen,
      provider,
      setAccessModal,
      setError,
      setEthBalances,
      setEthId,
      setEthWallet,
      setHintModal,
      setNormalBg,
      setProvider,
      setWalletName,
      setZkBalances,
      setZkWallet,
      walletName,
      zkWallet,
    }) => ({
      error: error.get(),
      hintModal: hintModal.get(),
      isAccessModalOpen: isAccessModalOpen.get(),
      provider: provider.get(),
      setAccessModal,
      setError,
      setEthBalances,
      setEthId,
      setEthWallet,
      setHintModal,
      setNormalBg,
      setProvider,
      setWalletName,
      setZkBalances,
      setZkWallet,
      walletName: walletName.get(),
      zkWallet: zkWallet.get(),
    }),
  );

  const [curAddress, setCurAddress] = useState<string>(
    provider?.selectedAddress,
  );

  const handleLogOut = useLogout();
  const cancelable = useCancelable();

  if (provider && walletName === 'Metamask') {
    provider.on('networkChanged', () => {
      setWalletName('');
      setAccessModal(true);
      setWalletName('Metamask');
    });
  }

  useEffect(() => {
    if (provider?.selectedAddress == null && walletName) {
      setAccessModal(true);
    }
    if (provider && walletName) {
      setCurAddress(provider?.selectedAddress);
    }
    if (
      (walletName === 'Metamask' &&
        curAddress?.length &&
        !zkWallet &&
        provider?.networkVersion === RIGHT_NETWORK_ID) ||
      (!zkWallet && walletName && walletName !== 'Metamask')
    ) {
      cancelable(createWallet());
      setHintModal('');
    }
    if (error) {
      setAccessModal(false);
    }
    if (curAddress && walletName) {
      setHintModal('Connected! Make sign in the pop up');
    }
  }, [
    cancelable,
    createWallet,
    curAddress,
    error,
    provider,
    setAccessModal,
    setHintModal,
    setWalletName,
    walletName,
    zkWallet,
  ]);

  useInterval(() => {
    if (!curAddress && walletName && provider?.selectedAddress) {
      setCurAddress(provider?.selectedAddress);
    }
  }, 5000);

  const params = useQuery();
  if (zkWallet) {
    return <Redirect to={`/${params.get('redirect') || 'account'}`} />;
  }

  return (
    <>
      <LazyWallet />
      <>
        <Modal
          background={false}
          classSpecifier={`metamask ${
            walletName
              ? walletName.replace(/\s+/g, '').toLowerCase()
              : 'primary-page'
          }`}
          visible={isAccessModalOpen}
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
                {'Connecting to '}
                {walletName}
              </h3>
              <p>
                {hintModal ? hintModal : 'Follow the instructions in the popup'}
              </p>
              <Spinner />
            </>
          ) : (
            <>
              <h3>
                {'Connecting to '}
                {walletName}
              </h3>
              <div className='wrong-network'>
                <div className='wrong-network-logo'></div>
                <p>
                  {`You are in the wrong network.
                  Please switch to ${RIGHT_NETWORK_NAME}`}
                </p>
              </div>
              <button
                className='btn submit-button'
                onClick={() => handleLogOut(false, '')}
              >
                {'Disconnect '}
                {walletName}
              </button>
            </>
          )}
        </Modal>
        {!walletName && (
          <>
            <div className='logo-textless'></div>
            <div className='welcome-text'>
              <h1>{'Welcome to zkSync.'}</h1>
              <h2>{'Simple, fast and secure token transfers.'}</h2>
              <p>{'Connect a wallet'}</p>
            </div>
            <div className='wallets-wrapper'>
              {Object.keys(WALLETS).map(key => (
                <button key={key} className='wallet-block'>
                  <div
                    className={`btn wallet-button ${key}`}
                    key={key}
                    onClick={() => {
                      if (wallets.includes(key)) {
                        setWalletName(key as WalletType);
                        setNormalBg(true);
                        setAccessModal(true);
                      } else {
                        setError(
                          `Your browser doesn't support ${key}, please select another wallet or switch browser`,
                        );
                      }
                    }}
                  ></div>
                  <p>{key}</p>
                </button>
              ))}
            </div>
          </>
        )}
      </>
    </>
  );
};

export default PrimaryPage;
