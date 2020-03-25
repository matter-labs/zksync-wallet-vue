import React, { useCallback, useEffect, useState } from 'react';
import { Redirect, useHistory } from 'react-router-dom';

import LazyWallet from '../components/Wallets/LazyWallet';
import Modal from '../components/Modal/Modal';
import Spinner from '../components/Spinner/Spinner';

import { useRootData } from '../hooks/useRootData';
import useWalletInit from '../hooks/useWalletInit';

import { WALLETS } from '../constants/Wallets';
import { RIGHT_NETWORK_ID } from '../constants/networks';

const PrimaryPage: React.FC = (): JSX.Element => {
  const { createWallet } = useWalletInit();

  const {
    error,
    isAccessModalOpen,
    provider,
    setAccessModal,
    setNormalBg,
    setProvider,
    setWalletName,
    setZkWallet,
    walletName,
    zkWallet,
  } = useRootData(
    ({
      error,
      isAccessModalOpen,
      provider,
      setAccessModal,
      setEthBalances,
      setEthId,
      setEthWallet,
      setNormalBg,
      setProvider,
      setWalletName,
      setZkBalances,
      setZkWallet,
      walletName,
      zkWallet,
    }) => ({
      error: error.get(),
      isAccessModalOpen: isAccessModalOpen.get(),
      provider: provider.get(),
      setAccessModal,
      setEthBalances,
      setEthId,
      setEthWallet,
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
        curAddress &&
        !!curAddress.length &&
        !zkWallet) ||
      (!zkWallet && walletName && walletName !== 'Metamask')
    ) {
      createWallet();
    }
    if (error) {
      setAccessModal(false);
    }
  }, [
    createWallet,
    curAddress,
    error,
    provider,
    setAccessModal,
    walletName,
    zkWallet,
  ]);

  if (!curAddress && walletName && provider) {
    setInterval(() => {
      if (provider?.selectedAddress) {
        setCurAddress(provider?.selectedAddress);
      }
    }, 2000);
  }

  return (
    <>
      <LazyWallet />
      {zkWallet ? (
        <Redirect to='/account' />
      ) : (
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
                {Object.keys(WALLETS).map(key => (
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
      )}
    </>
  );
};

export default PrimaryPage;
