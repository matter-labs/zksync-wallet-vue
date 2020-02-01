import React, { useCallback, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { ethers } from 'ethers';
import { getEthereumBalance, Wallet, Provider, ETHProxy, getDefaultProvider } from 'zksync';

import { Button, Modal, Spin } from 'antd';

import { useRootData } from '../hooks/useRootData';

import { IEthBalance } from '../types/Common';

import { WALLETS } from '../constants/Wallets';

const PrimaryPage: React.FC = (): JSX.Element => {
  const [isModalOpen, openModal] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isAccount, setAccount] = useState<boolean>(false);
  const [walletName, setWalletName] = useState<string>('');

  const { ethId, setEthBalances, setEthId, setEthWallet, setZkBalances, setZkWallet } = useRootData(
    ({ ethId, setEthBalances, setEthId, setEthWallet, setZkBalances, setZkWallet }) => ({
      ethId: ethId.get(),
      setEthBalances,
      setEthId,
      setEthWallet,
      setZkBalances,
      setZkWallet,
    }),
  );

  const createWallet = useCallback(async () => {
    try {
      const [{ provider }] = WALLETS.filter(({ name }) => name === walletName);
      const wallet = new ethers.providers.Web3Provider(provider).getSigner();

      setEthWallet(wallet);

      const network = process.env.ETH_NETWORK === 'localhost' ? 'localhost' : 'testnet';
      const syncProvider: Provider = await getDefaultProvider(network, 'HTTP');
      const ethersProvider = ethers.getDefaultProvider('rinkeby');
      const ethProxy = new ETHProxy(ethersProvider, syncProvider.contractAddress);
      const syncWallet = await Wallet.fromEthSigner(wallet, syncProvider, ethProxy);

      setZkWallet(syncWallet);

      const tokens = await syncProvider.getTokens();

      const balancePromises = Object.keys(tokens).map(async key => {
        if (tokens[key].symbol) {
          const balance = await getEthereumBalance(wallet, key);
          return {
            address: tokens[key].address,
            balance: +balance / Math.pow(10, 18),
            symbol: tokens[key].symbol,
          };
        }
      });

      Promise.all(balancePromises)
        .then(res => {
          const balance = res.filter(token => token);
          setEthBalances(balance as IEthBalance[]);
        })
        .catch(err => console.error(err));

      const zkBalance = (await syncWallet.getAccountState()).committed.balances;
      const zkBalancePromises = Object.keys(zkBalance).map(async key => {
        return {
          address: tokens[key].address,
          balance: +zkBalance[key] / Math.pow(10, 18),
          symbol: tokens[key].symbol,
        };
      });

      Promise.all(zkBalancePromises)
        .then(res => {
          setZkBalances(res as IEthBalance[]);
        })
        .catch(err => console.error(err));

      setAccount(true);
    } catch (e) {
      console.error(e);
    }
  }, [setEthBalances, setEthWallet, setZkBalances, setZkWallet, walletName]);

  const connect = useCallback(
    (name, provider, signUp) => {
      if (provider) {
        signUp()
          .then(async res => {
            setEthId(res?.[0]);
            setWalletName(name);
            openModal(true);
          })
          .catch(err => console.error(err))
          .finally(() => setLoading(false));
      } else {
        console.error(`${name} not found`);
      }
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
          {WALLETS.map(({ name, provider, signUp }) => (
            <Button key={name} onClick={() => connect(name, provider, signUp)}>
              {name}
            </Button>
          ))}
        </>
      )}
    </>
  );
};

export default PrimaryPage;
