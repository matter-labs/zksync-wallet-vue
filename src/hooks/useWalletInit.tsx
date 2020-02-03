import { useCallback } from 'react';
import { ethers } from 'ethers';
import { getEthereumBalance, Wallet, Provider, ETHProxy, getDefaultProvider } from 'zksync';

import { useRootData } from '../hooks/useRootData';

import { IEthBalance } from '../types/Common';

const useWalletInit = () => {
  const {
    setAccessModal,
    setEthBalances,
    setEthId,
    setEthWallet,
    setZkBalances,
    setZkWallet,
    provider,
    walletName,
  } = useRootData(
    ({ setAccessModal, setEthBalances, setEthId, setEthWallet, setZkBalances, setZkWallet, provider, walletName }) => ({
      setAccessModal,
      setEthBalances,
      setEthId,
      setEthWallet,
      setZkBalances,
      setZkWallet,
      provider: provider.get(),
      walletName: walletName.get(),
    }),
  );

  const connect = useCallback(
    (provider, signUp) => {
      if (provider) {
        console.log(provider);
        signUp()
          .then(async res => {
            console.log(res);
            setEthId(res);
            setAccessModal(true);
          })
          .catch(err => console.error(err));
      } else {
        console.error(`${walletName} not found`);
      }
    },
    [setAccessModal, setEthId, walletName],
  );

  const getSigner = useCallback(provider => {
    const signer = new ethers.providers.Web3Provider(provider).getSigner();
    return signer;
  }, []);

  const createWallet = useCallback(async () => {
    try {
      const wallet = getSigner(provider);
      setEthWallet(wallet);
      const network = process.env.ETH_NETWORK === 'localhost' ? 'localhost' : 'testnet';
      const syncProvider: Provider = await getDefaultProvider(network);
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
    } catch (e) {
      console.error(e);
    }
  }, [getSigner, provider, setEthBalances, setEthWallet, setZkBalances, setZkWallet]);

  return {
    connect,
    createWallet,
    getSigner,
  };
};

export default useWalletInit;
