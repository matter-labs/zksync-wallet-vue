import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { ethers, providers } from 'ethers';

import { useRootData } from 'hooks/useRootData';

import { IEthBalance } from 'types/Common';

import { DEFAULT_ERROR } from 'constants/errors';
import { WSTransport } from 'zksync/build/transport';
import { fetchTransactions } from 'src/api';
import { useLogout } from './useLogout';

const useWalletInit = () => {
  const {
    setAccessModal,
    setError,
    setEthBalances,
    setEthId,
    setEthWallet,
    setTokens,
    setWSTransport,
    setZkBalances,
    setZkBalancesLoaded,
    setZkWallet,
    provider,
    walletName,
    setTxs,
  } = useRootData(({ provider, walletName, ...s }) => ({
    ...s,
    provider: provider.get(),
    walletName: walletName.get(),
  }));

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
            err.name && err.message
              ? setError(`${err.name}: ${err.message}`)
              : setError(DEFAULT_ERROR);
          });
      } else {
        setError(`${walletName} not found`);
      }
    },
    [setAccessModal, setError, setEthId, walletName],
  );

  const getSigner = useCallback(provider => {
    if (provider) {
      const signer = new ethers.providers.Web3Provider(provider).getSigner();
      return signer;
    }
  }, []);

  const logout = useLogout();

  const createWallet = useCallback(async () => {
    try {
      const zkSync = await import('zksync');
      const wallet = getSigner(provider);
      setEthWallet(wallet as ethers.providers.JsonRpcSigner);
      const network =
        process.env.ETH_NETWORK === 'localhost' ? 'localhost' : 'testnet';

      const syncProvider = await zkSync.getDefaultProvider(network, 'WS');
      const signer = await zkSync.Signer.fromETHSignature(
        wallet as ethers.providers.JsonRpcSigner,
      );
      const syncWallet = await zkSync.Wallet.fromEthSigner(
        wallet as ethers.providers.JsonRpcSigner,
        syncProvider,
        signer,
      );
      const transport = syncProvider.transport as WSTransport;

      setWSTransport(transport);
      setZkWallet(syncWallet);

      const web3Provider = new ethers.providers.Web3Provider(provider);
      const initialTransactions = await fetchTransactions(
        10,
        0,
        syncWallet.address(),
        web3Provider,
      );
      setTxs(initialTransactions);

      const tokens = await syncProvider.getTokens();
      setTokens(tokens);

      const balancePromises = Object.keys(tokens).map(async key => {
        if (tokens[key].symbol) {
          const balance = await syncWallet.getEthereumBalance(key);
          return {
            address: tokens[key].address,
            balance: +ethers.utils.formatEther(balance),
            symbol: tokens[key].symbol,
          };
        }
      });

      await Promise.all(balancePromises)
        .then(res => {
          const balance = res.filter(token => token);
          setEthBalances(balance as IEthBalance[]);
        })
        .catch(err => {
          err.name && err.message
            ? setError(`${err.name}: ${err.message}`)
            : setError(DEFAULT_ERROR);
        });

      const zkBalance = (await syncWallet.getAccountState()).committed.balances;
      const zkBalancePromises = Object.keys(zkBalance).map(async key => {
        return {
          address: tokens[key].address,
          balance: +ethers.utils.formatEther(zkBalance[key]),
          symbol: tokens[key].symbol,
        };
      });

      await Promise.all(zkBalancePromises)
        .then(res => {
          setZkBalances(res as IEthBalance[]);
        })
        .then(() => setZkBalancesLoaded(true))
        .catch(err => {
          err.name && err.message
            ? setError(`${err.name}: ${err.message}`)
            : setError(DEFAULT_ERROR);
        });
    } catch (err) {
      const error = err.message
        ? !!err.message.match(/(?:denied)/i)
        : !!err.match(/(?:denied)/i);
      if (error) {
        logout(false, '');
      }
      console.error('CreateWallet error', err);
    }
  }, [
    logout,
    getSigner,
    provider,
    setError,
    setEthBalances,
    setTokens,
    setEthWallet,
    setZkBalances,
    setZkBalancesLoaded,
    setZkWallet,
    setTxs,
    setWSTransport,
  ]);

  return {
    connect,
    createWallet,
    getSigner,
  };
};

export default useWalletInit;
