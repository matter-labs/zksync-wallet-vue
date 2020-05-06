import { useCallback, useState } from 'react';
import { ethers } from 'ethers';

import { useRootData } from 'hooks/useRootData';
import { useCancelable } from 'hooks/useCancelable';

import { DEFAULT_ERROR } from 'constants/errors';
import { WSTransport } from 'zksync/build/transport';
import { fetchTransactions } from 'src/api';
import { useLogout } from './useLogout';
import { loadTokens } from 'src/utils';

const useWalletInit = () => {
  const {
    setAccessModal,
    setBalances,
    setError,
    setEthBalances,
    setEthId,
    setEthWallet,
    setTokens,
    setUnlocked,
    setWSTransport,
    setZkBalances,
    setZkBalancesLoaded,
    setZkWallet,
    provider,
    walletName,
    setTxs,
    setPrice,
    setVerified,
    zkWalletInitializing,
    syncProvider: storeSyncProvider,
    syncWallet: storeSyncWallet,
    zkWallet,
    accountState,
  } = useRootData(({ provider, walletName, zkWallet, ...s }) => ({
    ...s,
    provider: provider.get(),
    walletName: walletName.get(),
    zkWallet: zkWallet.get(),
  }));

  const cancelable = useCancelable();

  const connect = useCallback(
    (provider, signUp) => {
      if (provider) {
        signUp()
          .then(async res => {
            setEthId(res);
            zkWalletInitializing.set(false);
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
      const _accountState = await syncWallet.getAccountState();
      accountState.set(_accountState);

      const { error, ethBalances, tokens, zkBalances } = await loadTokens(
        syncProvider,
        syncWallet,
        _accountState,
      );
      if (error) {
        setError(error);
      }
      setTokens(tokens);
      setEthBalances(ethBalances);
      setBalances(zkBalances);
      setZkBalances(zkBalances);
      setZkBalancesLoaded(true);

      cancelable(zkWallet?.getAccountState()).then((res: any) => {
        setVerified(res?.verified.balances);
      });

      cancelable(
        fetch(
          'https://ticker-nhq6ta45ia-ez.a.run.app/cryptocurrency/listings/latest',
          {
            referrerPolicy: 'strict-origin-when-cross-origin',
            body: null,
            method: 'GET',
            mode: 'cors',
          },
        ),
      )
        .then((res: any) => res.json())
        .then(data => {
          const prices = {};
          Object.keys(data.data).map(
            el =>
              (prices[data.data[el].symbol] = data.data[el].quote.USD.price),
          );
          setPrice(prices);
        })
        .catch(err => {
          console.error(err);
        });

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
