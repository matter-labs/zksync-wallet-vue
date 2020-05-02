import { useCallback } from 'react';
import { ethers } from 'ethers';

import { useRootData } from 'hooks/useRootData';

import { DEFAULT_ERROR } from 'constants/errors';
import { WSTransport } from 'zksync/build/transport';
import { fetchTransactions } from 'src/api';
import { useLogout } from './useLogout';
import { loadTokens } from 'src/utils';

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
    zkWalletInitializing,
    syncProvider: storeSyncProvider,
    syncWallet: storeSyncWallet,
  } = useRootData(({ provider, walletName, ...s }) => ({
    ...s,
    provider: provider.get(),
    walletName: walletName.get(),
  }));

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
      zkWalletInitializing.set(true);

      const wallet = getSigner(provider);
      setEthWallet(wallet as ethers.providers.JsonRpcSigner);
      const network =
        process.env.ETH_NETWORK === 'localhost' ? 'localhost' : 'testnet';

      const syncProvider = await zkSync.getDefaultProvider(network, 'HTTP');
      const signer = await zkSync.Signer.fromETHSignature(
        wallet as ethers.providers.JsonRpcSigner,
      );
      const syncWallet = await zkSync.Wallet.fromEthSigner(
        wallet as ethers.providers.JsonRpcSigner,
        syncProvider,
        signer,
      );
      const transport = syncProvider.transport as WSTransport;

      storeSyncProvider.set(syncProvider);
      storeSyncWallet.set(syncWallet);
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

      const { error, ethBalances, tokens, zkBalances } = await loadTokens(
        syncProvider,
        syncWallet,
      );
      if (error) {
        setError(error);
      }
      setTokens(tokens);
      setEthBalances(ethBalances);
      setZkBalances(zkBalances);
      setZkBalancesLoaded(true);

      zkWalletInitializing.set(false);
    } catch (err) {
      zkWalletInitializing.set(false);
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
    zkWalletInitializing,
    storeSyncProvider,
    storeSyncWallet,
  ]);

  return {
    connect,
    createWallet,
    getSigner,
  };
};

export default useWalletInit;
