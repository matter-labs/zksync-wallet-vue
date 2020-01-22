import React, { useCallback, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { ethers } from 'ethers';
import { getEthereumBalance, Wallet, Provider, ETHProxy, getDefaultProvider } from 'zksync';

import { Button, Modal, Spin } from 'antd';

import { useRootData } from '../hooks/useRootData';

const PrimaryPage: React.FC = (): JSX.Element => {
  const [isModalOpen, openModal] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isAccount, setAccount] = useState<boolean>(false);

  const { ethId, setEthBalance, setEthId, setZkBalance } = useRootData(
    ({ ethId, setEthBalance, setEthId, setZkBalance }) => ({
      ethId: ethId.get(),
      setEthBalance,
      setEthId,
      setZkBalance,
    }),
  );

  const createWallet = useCallback(async () => {
    try {
      const wallet = new ethers.providers.Web3Provider(window['ethereum']).getSigner();
      const network = process.env.ETH_NETWORK === 'localhost' ? 'localhost' : 'testnet';
      const syncProvider: Provider = await getDefaultProvider(network, 'HTTP');
      const ethersProvider = ethers.getDefaultProvider('rinkeby');
      const ethProxy = new ETHProxy(ethersProvider, syncProvider.contractAddress);
      const syncWallet = await Wallet.fromEthSigner(wallet, syncProvider, ethProxy);

      const ehtBalance = await await getEthereumBalance(wallet, 'ETH');
      const zkBalance = await (await syncWallet.getAccountState()).committed.nonce;
      setZkBalance(zkBalance);
      setEthBalance(+ehtBalance / Math.pow(10, 18));
      setAccount(true);
    } catch (e) {
      console.error(e);
    }
  }, [setEthBalance, setZkBalance]);

  const connect = useCallback(() => {
    if (window['ethereum']) {
      window['ethereum']
        .enable()
        .then(async res => {
          setEthId(res[0]);
          openModal(true);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [setEthId]);

  return (
    <>
      {isAccount ? (
        <Redirect to="/account" />
      ) : (
        <>
          <Modal title="Metamask" visible={isModalOpen} onOk={() => openModal(false)} onCancel={() => openModal(false)}>
            {isLoading && !ethId ? (
              <Spin tip="Connecting..." />
            ) : (
              <Button onClick={createWallet}>Access my account</Button>
            )}
          </Modal>
          <Button onClick={connect}>Metamask</Button>
        </>
      )}
    </>
  );
};

export default PrimaryPage;
