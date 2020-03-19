import React, { useCallback, useEffect, useState } from 'react';
import { Redirect, useHistory } from 'react-router-dom';

import LazyWallet from '../components/Wallets/LazyWallet';
import Modal from '../components/Modal/Modal';

import { useRootData } from '../hooks/useRootData';
import useWalletInit from '../hooks/useWalletInit';

import { WALLETS } from '../constants/Wallets';
import Spinner from '../components/Spinner/Spinner';

const PrimaryPage: React.FC = (): JSX.Element => {
  const { createWallet } = useWalletInit();

  const {
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

  const [curAddress, setCurAddress] = useState<string>(provider?.selectedAddress);

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
    if (curAddress && !zkWallet) {
      createWallet();
    }
  }, [createWallet, curAddress, provider, setAccessModal, walletName, zkWallet]);

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
        <Redirect to="/account" />
      ) : (
        <>
          <Modal
            background={false}
            classSpecifier={`metamask ${walletName ? walletName.replace(/\s+/g, '').toLowerCase() : 'primary-page'}`}
            visible={isAccessModalOpen}
            cancelAction={() => handleLogOut()}
          >
            <div className={`${walletName.replace(/\s+/g, '').toLowerCase()}-logo`}></div>
            {provider && provider.networkVersion === '4' ? ( //TODO: need to change on prod
              <>
                <h3 className="title-connecting">Connecting to {walletName}</h3>
                <p>Follow the instructions in the popup</p>
                <Spinner />
              </>
            ) : (
              <>
                <h3>Connecting to {walletName}</h3>
                <div className="wrong-network">
                  <div className="wrong-network-logo"></div>
                  <p>
                    You are in the wrong network. <br />
                    Please switch to mainnet
                  </p>
                </div>
                <button className="btn submit-button" onClick={() => handleLogOut()}>
                  Disconnect {walletName}
                </button>
              </>
            )}
          </Modal>
          {!walletName && (
            <>
              <div className="logo-textless"></div>
              <div className="welcome-text">
                <h1>Welcome to ZK Sync.</h1>
                <h2>Simple, fast and secure token transfers.</h2>
                <p>Connect a wallet</p>
              </div>
              <div className="wallets-wrapper">
                {Object.keys(WALLETS).map(key => (
                  <button key={key} className="wallet-block">
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
