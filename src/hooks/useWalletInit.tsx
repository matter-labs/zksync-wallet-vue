import { useCallback, useState } from 'react';
import { ethers } from 'ethers';

import { useRootData } from 'hooks/useRootData';
import { useCancelable } from 'hooks/useCancelable';

import { DEFAULT_ERROR } from 'constants/errors';
import { WSTransport } from 'zksync/build/transport';
import { fetchTransactions } from 'src/api';
import { useLogout } from './useLogout';
import { loadTokens } from 'src/utils';
import { useStore } from 'src/store/context';

const useWalletInit = () => {
  // const {
  //   // setAccessModal,
  //   // setBalances,
  //   // setError,
  //   // setEthBalances,
  //   // setEthId,
  //   // setEthWallet,
  //   // setTokens,
  //   // setUnlocked,
  //   // setWSTransport,
  //   // setZkBalances,
  //   // setZkBalancesLoaded,
  //   // setZkWallet,
  //   // provider,
  //   // walletName,
  //   // setTxs,
  //   // setPrice,
  //   // setVerified,
  //   // zkWalletInitializing,
  //   // syncProvider: storeSyncProvider,
  //   // syncWallet: storeSyncWallet,
  //   // zkWallet,
  // } = useRootData(({ provider, walletName, zkWallet, ...s }) => ({
  //   ...s,
  //   provider: provider.get(),
  //   walletName: walletName.get(),
  //   zkWallet: zkWallet.get(),
  // }));
  const store = useStore();

  const cancelable = useCancelable();

  const connect = useCallback(
    (provider, signUp) => {
      if (provider) {
        signUp()
          .then(async res => {
            console.log('Signed up');
            store.ethId = res;
            // setEthId(res);
            store.zkWalletInitializing = false;
            store.isAccessModalOpen = true;
            // zkWalletInitializing.set(false);
            // setAccessModal(true);
          })
          .catch(err => {
            store.error =
              err.name && err.message
                ? `${err.name}: ${err.message}`
                : DEFAULT_ERROR;
          });
      } else {
        store.error = `${store.walletName} not found`;
      }
    },
    [
      store.error,
      store.ethId,
      store.isAccessModalOpen,
      store.walletName,
      store.zkWalletInitializing,
    ],
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
      store.zkWalletInitializing = true;
      // zkWalletInitializing.set(true);

      const provider = store.provider;
      const wallet = getSigner(provider);
      store.ethWallet = wallet;
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

      store.syncProvider = syncProvider;
      store.syncWallet = syncWallet;
      store.wsTransport = transport;
      store.zkWallet = syncWallet;

      const web3Provider = new ethers.providers.Web3Provider(provider);
      const initialTransactions = await fetchTransactions(
        10,
        0,
        syncWallet.address(),
        web3Provider,
      );
      store.transactions = initialTransactions;

      const { error, ethBalances, tokens, zkBalances } = await loadTokens(
        syncProvider,
        syncWallet,
      );
      if (error) {
        store.error = error;
      }
      store.tokens = tokens;
      store.ethBalances = ethBalances;
      store.searchBalances = zkBalances;
      store.zkBalances = zkBalances;
      store.zkBalancesLoaded = true;
      const res = await store.zkWallet?.getAccountState();
      if (res?.id) {
        await cancelable(store.zkWallet?.isSigningKeySet()).then(data => {
          store.unlocked = data;
        });
      } else {
        store.unlocked = true;
      }

      cancelable(store.zkWallet?.getAccountState()).then((res: any) => {
        store.verified = res?.verified.balance;
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
          store.price = prices;
        })
        .catch(err => {
          console.error(err);
        });

      store.zkWalletInitializing = false;
    } catch (err) {
      store.zkWalletInitializing = false;
      const error = err.message
        ? !!err.message.match(/(?:denied)/i)
        : !!err.match(/(?:denied)/i);
      if (error) {
        logout(false, '');
      }
      console.error('CreateWallet error', err);
    }
  }, [cancelable, getSigner, logout, store]);

  return {
    connect,
    createWallet,
    getSigner,
  };
};

export default useWalletInit;
