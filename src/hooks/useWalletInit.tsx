import { useCallback, useState } from 'react';
import { ethers } from 'ethers';

import { useCancelable } from 'hooks/useCancelable';

import { DEFAULT_ERROR } from 'constants/errors';
import { WSTransport } from 'zksync/build/transport';
import { fetchTransactions } from 'src/api';
import { useLogout } from './useLogout';
import { loadTokens } from 'src/utils';
import { useStore } from 'src/store/context';

const useWalletInit = () => {
  const store = useStore();
  const cancelable = useCancelable();

  const connect = useCallback(
    (provider, signUp) => {
      store.zkWalletInitializing = true;

      if (provider) {
        signUp()
          .then(async res => {
            store.ethId = res;
            store.zkWalletInitializing = false;
            store.isAccessModalOpen = true;
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
    [store],
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

      const provider = store.provider;
      const wallet = getSigner(provider);
      store.ethWallet = wallet;
      const network =
        process.env.ETH_NETWORK === 'localhost' ? 'localhost' : 'testnet';
      const syncProvider = await zkSync.getDefaultProvider(network, 'WS');

      const syncWallet = await zkSync.Wallet.fromEthSigner(
        wallet as ethers.providers.JsonRpcSigner,
        syncProvider,
      );

      const transport = syncProvider.transport as WSTransport;
      const accountState = await syncWallet.getAccountState();

      store.setBatch({
        syncProvider: syncProvider,
        syncWallet: syncWallet,
        wsTransport: transport,
        zkWallet: syncWallet,
        accountState: accountState,
      });

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
        accountState,
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
      const arr = JSON.parse(
        localStorage.getItem(`contacts${store.zkWallet?.address()}`) || '[]',
      );
      store.searchContacts = arr;
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
          store.price = Object.entries(data.data).reduce(
            (acc, [el, val]: [any, any]) =>
              Object.assign(acc, { [val.symbol]: val.quote.USD.price }),
            {},
          );
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
