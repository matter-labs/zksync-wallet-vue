import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Redirect, useHistory, useLocation, useParams } from 'react-router-dom';

import LazyWallet from 'components/Wallets/LazyWallet';
import Modal from 'components/Modal/Modal';
import Spinner from 'components/Spinner/Spinner';

import { useRootData } from 'hooks/useRootData';
import useWalletInit from 'hooks/useWalletInit';
import { useInterval, useTimeout } from 'hooks/timers';

import { MOBILE_DEVICE } from 'constants/regExs';
import { RIGHT_NETWORK_ID } from 'constants/networks';
import {
  BRAVE_NON_WORKING_WALLETS,
  DESKTOP_ONLY_WALLETS,
  MOBILE_ONLY_WALLETS,
  WALLETS,
} from 'constants/Wallets';
import { useQuery } from 'src/hooks/useQuery';

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

  const history = useHistory();

  const [curAddress, setCurAddress] = useState<string>(
    provider?.selectedAddress,
  );

  const handleLogOut = useCallback(() => {
    setProvider(null);
    setWalletName('');
    setAccessModal(false);
    setZkWallet(null);
    history.push('/');
  }, [history, setAccessModal, setProvider, setWalletName, setZkWallet]);

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
      createWallet();
    }
    if (error) {
      setAccessModal(false);
    }
    if (curAddress && walletName) {
      setHintModal('Connected! Follow the instructions in the popup');
    }
  }, [
    createWallet,
    curAddress,
    provider,
    setAccessModal,
    walletName,
    zkWallet,
  ]);

  useTimeout(
    () => {
      if (hintModal) setHintModal('');
    },
    2000,
    [hintModal],
  );

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
      {!!hintModal.length && <div className='hint-modal'>{hintModal}</div>}
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
          cancelAction={() => handleLogOut()}
        >
          <div
            className={`${walletName.replace(/\s+/g, '').toLowerCase()}-logo`}
          ></div>
          {(provider && walletName !== 'Metamask') ||
          (provider &&
            walletName === 'Metamask' &&
            provider.networkVersion === RIGHT_NETWORK_ID) ? ( //TODO: need to change on prod
            <>
              <h3 onClick={createWallet} className='title-connecting'>
                Connecting to {walletName}
              </h3>
              <p>Follow the instructions in the popup</p>
              <Spinner />
            </>
          ) : (
            <>
              <h3>Connecting to {walletName}</h3>
              <div className='wrong-network'>
                <div className='wrong-network-logo'></div>
                <p>
                  You are in the wrong network. <br />
                  Please switch to mainnet
                </p>
              </div>
              <button
                className='btn submit-button'
                onClick={() => handleLogOut()}
              >
                Disconnect {walletName}
              </button>
            </>
          )}
        </Modal>
        {!walletName && (
          <>
            <div className='logo-textless'></div>
            <div className='welcome-text'>
              <h1>Welcome to zkSync.</h1>
              <h2>Simple, fast and secure token transfers.</h2>
              <p>Connect a wallet</p>
            </div>
            <div className='wallets-wrapper'>
              {wallets.map(key => (
                <button key={key} className='wallet-block'>
                  <div
                    className={`btn wallet-button ${key}`}
                    key={key}
                    onClick={() => {
                      setWalletName(key);
                      setNormalBg(true);
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
