import React from 'react';
import { Redirect } from 'react-router-dom';

import LazyWallet from '../components/Wallets/LazyWallet';
import Modal from '../components/Modal/Modal';

import { useRootData } from '../hooks/useRootData';
import useWalletInit from '../hooks/useWalletInit';

import { WALLETS } from '../constants/Wallets';

const PrimaryPage: React.FC = (): JSX.Element => {
  const { createWallet } = useWalletInit();

  const { isAccessModalOpen, setAccessModal, setNormalBg, setWalletName, walletName, zkWallet } = useRootData(
    ({
      isAccessModalOpen,
      setAccessModal,
      setEthBalances,
      setEthId,
      setEthWallet,
      setNormalBg,
      setWalletName,
      setZkBalances,
      setZkWallet,
      walletName,
      zkWallet,
    }) => ({
      isAccessModalOpen: isAccessModalOpen.get(),
      setAccessModal,
      setEthBalances,
      setEthId,
      setEthWallet,
      setNormalBg,
      setWalletName,
      setZkBalances,
      setZkWallet,
      walletName: walletName.get(),
      zkWallet: zkWallet.get(),
    }),
  );

  return (
    <>
      <LazyWallet />
      {zkWallet ? (
        <Redirect to="/account" />
      ) : (
        <>
          <Modal
            background={false}
            classSpecifier="metamask"
            visible={isAccessModalOpen}
            cancelAction={() => setAccessModal(false)}
          >
            <div className="metamask-logo"></div>
            <h3>Connected to Metamask</h3>
            <button className="btn submit-button" onClick={createWallet}>
              Access my account
            </button>
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
                  <button
                    key={key}
                    className="wallet-block"
                    onClick={() => {
                      setWalletName(key);
                      setNormalBg(true);
                    }}
                  >
                    <div className={`btn wallet-button ${key}`} key={key}></div>
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
