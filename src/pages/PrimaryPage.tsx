import React from 'react';

import LazyWallet from '../components/Wallets/LazyWallet';

import { Button, Modal } from 'antd';

import { useRootData } from '../hooks/useRootData';
import useWalletInit from '../hooks/useWalletInit';

import { WALLETS } from '../constants/Wallets';

const PrimaryPage: React.FC = (): JSX.Element => {
  const { createWallet } = useWalletInit();

  const { isAccessModalOpen, setAccessModal, setWalletName } = useRootData(
    ({ isAccessModalOpen, setAccessModal, setWalletName }) => ({
      isAccessModalOpen: isAccessModalOpen.get(),
      setAccessModal,
      setWalletName,
    }),
  );

  return (
    <>
      <LazyWallet />
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
    </>
  );
};

export default PrimaryPage;
