import React from 'react';
import { Redirect } from 'react-router-dom';

import LazyWallet from '../components/Wallets/LazyWallet';
import MyWallet from '../components/Wallets/MyWallet';

import { Button, Modal } from 'antd';

import { useRootData } from '../hooks/useRootData';
import useWalletInit from '../hooks/useWalletInit';

import { WALLETS } from '../constants/Wallets';

const PrimaryPage: React.FC = (): JSX.Element => {
  const { createWallet } = useWalletInit();

  const { isAccessModalOpen, setAccessModal, setWalletName, zkWallet } = useRootData(
    ({
      isAccessModalOpen,
      setAccessModal,
      setEthBalances,
      setEthId,
      setEthWallet,
      setWalletName,
      setZkBalances,
      setZkWallet,
      zkWallet,
    }) => ({
      isAccessModalOpen: isAccessModalOpen.get(),
      setAccessModal,
      setEthBalances,
      setEthId,
      setEthWallet,
      setWalletName,
      setZkBalances,
      setZkWallet,
      zkWallet: zkWallet.get(),
    }),
  );

  return (
    <>
      <MyWallet title="My Wallet" />
      <LazyWallet />
      {zkWallet ? (
        <Redirect to="/account" />
      ) : (
        <>
          <Modal
            title="Name"
            visible={isAccessModalOpen}
            onOk={() => setAccessModal(false)}
            onCancel={() => setAccessModal(false)}
          >
            <Button onClick={createWallet}>Access my account</Button>
          </Modal>
          {Object.keys(WALLETS).map(key => (
            <Button onClick={() => setWalletName(key)} key={key}>
              {key}
            </Button>
          ))}
        </>
      )}
    </>
  );
};

export default PrimaryPage;
