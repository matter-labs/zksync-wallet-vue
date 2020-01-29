import React, { useCallback, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { ethers } from 'ethers';
import { getEthereumBalance, Wallet, Provider, ETHProxy, getDefaultProvider } from 'zksync';

import { Button, Modal, Spin } from 'antd';

import { useRootData } from '../hooks/useRootData';

import { WALLETS } from '../constants/Wallets';

const PrimaryPage: React.FC = (): JSX.Element => {
  const [isModalOpen, openModal] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isAccount, setAccount] = useState<boolean>(false);
  const [walletName, setWalletName] = useState<string>('');

  const { ethId, setEthBalance, setEthId, setEthWallet, setZkBalance, setZkWallet } = useRootData(
    ({ ethId, setEthBalance, setEthId, setEthWallet, setZkBalance, setZkWallet }) => ({
      ethId: ethId.get(),
      setEthBalance,
      setEthId,
      setEthWallet,
      setZkBalance,
      setZkWallet,
    }),
  );

  const createWallet = useCallback(async () => {
    try {
      const [{ provider }] = WALLETS.filter(({ name }) => name === walletName);
      const wallet = new ethers.providers.Web3Provider(provider).getSigner();
      setEthWallet(wallet);

      const network = process.env.ETH_NETWORK === 'localhost' ? 'localhost' : 'testnet';
      const syncProvider: Provider = await getDefaultProvider(network);
      const ethersProvider = ethers.getDefaultProvider('rinkeby');
      const ethProxy = new ETHProxy(ethersProvider, syncProvider.contractAddress);
      const syncWallet = await Wallet.fromEthSigner(wallet, syncProvider, ethProxy);
      setZkWallet(syncWallet);

      const ehtBalance = await getEthereumBalance(wallet, 'ETH');
      const zkBalance = (await syncWallet.getAccountState()).committed.balances;
      setZkBalance(zkBalance);
      setEthBalance(+ehtBalance / Math.pow(10, 18));
      setAccount(true);
    } catch (e) {
      console.error(e);
    }
  }, [setEthBalance, setEthWallet, setZkBalance, setZkWallet, walletName]);

  const connect = useCallback(
    (signUp, name) => {
      signUp()
        .then(async res => {
          setEthId(res?.[0]);
          setWalletName(name);
          openModal(true);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    },
    [setEthId],
  );

  return (
    <>
      {isAccount ? (
        <Redirect to="/account" />
      ) : (
        <>
          <Modal title="Name" visible={isModalOpen} onOk={() => openModal(false)} onCancel={() => openModal(false)}>
            {isLoading && !ethId ? (
              <Spin tip="Connecting..." />
            ) : (
              <Button onClick={createWallet}>Access my account</Button>
            )}
          </Modal>
          {WALLETS.map(({ name, signUp }) => (
            <Button key={name} onClick={() => connect(signUp, name)}>
              {name}
            </Button>
          ))}
        </>
      )}
    </>
  );
};

export default PrimaryPage;
