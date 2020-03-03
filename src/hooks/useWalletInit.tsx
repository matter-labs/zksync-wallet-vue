import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { ethers } from 'ethers';
import { Wallet, Provider, getDefaultProvider } from 'zksync';

import { useRootData } from '../hooks/useRootData';

import { IEthBalance } from '../types/Common';

import { DEFAULT_ERROR } from '../constants/errors';

const useWalletInit = () => {
  const {
    setAccessModal,
    setError,
    setEthBalances,
    setEthId,
    setEthWallet,
    setTokens,
    setZkBalances,
    setZkBalancesLoaded,
    setZkWallet,
    provider,
    walletName,
  } = useRootData(
    ({
      setAccessModal,
      setError,
      setEthBalances,
      setEthId,
      setEthWallet,
      setTokens,
      setZkBalances,
      setZkBalancesLoaded,
      setZkWallet,
      provider,
      walletName,
    }) => ({
      setAccessModal,
      setError,
      setEthBalances,
      setEthId,
      setEthWallet,
      setTokens,
      setZkBalances,
      setZkBalancesLoaded,
      setZkWallet,
      provider: provider.get(),
      walletName: walletName.get(),
    }),
  );

  const history = useHistory();

  const connect = useCallback(
    (provider, signUp) => {
      if (provider) {
        signUp()
          .then(async res => {
            setEthId(res);
            setAccessModal(true);
          })
          .catch(err => {
            err.name && err.message ? setError(`${err.name}:${err.message}`) : setError(DEFAULT_ERROR);
          });
      } else {
        setError(`${walletName} not found`);
      }
    },
    [setAccessModal, setError, setEthId, walletName],
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
      const syncProvider: Provider = await getDefaultProvider(network, 'HTTP');
      const syncWallet = await Wallet.fromEthSigner(wallet, syncProvider);

      setZkWallet(syncWallet);
      history.push('/account');

      const tokens = await syncProvider.getTokens();

      setTokens(tokens);

      const balancePromises = Object.keys(tokens).map(async key => {
        if (tokens[key].symbol) {
          const balance = await syncWallet.getEthereumBalance(key);
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
        .catch(err => {
          err.name && err.message ? setError(`${err.name}:${err.message}`) : setError(DEFAULT_ERROR);
        });

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
        .then(() => setZkBalancesLoaded(true))
        .catch(err => {
          err.name && err.message ? setError(`${err.name}:${err.message}`) : setError(DEFAULT_ERROR);
        });
    } catch (err) {
      err.name && err.message ? setError(`${err.name}:${err.message}`) : setError(DEFAULT_ERROR);
    }
  }, [
    history,
    getSigner,
    provider,
    setError,
    setEthBalances,
    setTokens,
    setEthWallet,
    setZkBalances,
    setZkBalancesLoaded,
    setZkWallet,
  ]);

  return {
    connect,
    createWallet,
    getSigner,
  };
};

export default useWalletInit;
