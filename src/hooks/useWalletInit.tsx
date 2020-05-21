import { useCallback, useState } from 'react';
import { ethers } from 'ethers';

import { useCancelable } from 'hooks/useCancelable';

import { IEthBalance } from 'types/Common';

import { LINKS_CONFIG } from 'constants/links';

import { DEFAULT_ERROR } from 'constants/errors';
import { WSTransport } from 'zksync/build/transport';
import { fetchTransactions } from 'src/api';
import { useLogout } from './useLogout';
import { loadTokens, sortBalancesById } from 'src/utils';
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
        store.isAccessModalOpen = false;
        store.hint = 'Please install it \n https://metamask.io/';
        store.error = `${store.walletName} not detected`;
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
      const syncProvider = await zkSync.Provider.newWebsocketProvider(
        `wss://${LINKS_CONFIG.STAGE_ZKSYNC.api}/jsrpc-ws`,
      );
      const syncWallet = await zkSync.Wallet.fromEthSigner(
        wallet as ethers.providers.JsonRpcSigner,
        syncProvider,
      );

      // const network =
      //   process.env.ETH_NETWORK === 'localhost' ? 'localhost' : 'testnet';
      // const ethersProvider = await ethers.getDefaultProvider('rinkeby');
      // const syncProvider = await zkSync.getDefaultProvider(network, 'WS');

      // const ethWallet = ethers.Wallet.createRandom().connect(ethersProvider);

      // const syncWallet = await zkSync.Wallet.fromEthSigner(
      //   ethWallet,
      //   syncProvider,
      // );

      const transport = syncProvider.transport as WSTransport;
      const accountState = await syncWallet.getAccountState();
      store.verified = accountState?.verified.balances;
      const maxConfirmAmount = await syncProvider.getConfirmationsForEthOpAmount();

      store.setBatch({
        syncProvider: syncProvider,
        syncWallet: syncWallet,
        wsTransport: transport,
        zkWallet: syncWallet,
        accountState,
      });

      const web3Provider = new ethers.providers.Web3Provider(provider);

      await fetchTransactions(25, 0, syncWallet.address(), web3Provider)
        .then(res => (store.transactions = res))
        .catch(err => console.error(err));

      const { error, tokens, zkBalances } = await loadTokens(
        syncProvider,
        syncWallet,
        accountState,
      );
      if (error) {
        store.error = error;
      }

      const balancePromises = Object.keys(tokens).map(async key => {
        if (tokens[key].symbol) {
          const balance = await syncWallet.getEthereumBalance(key);
          return {
            id: tokens[key].id,
            address: tokens[key].address,
            balance: +balance / Math.pow(10, 18),
            symbol: tokens[key].symbol,
          };
        }
      });

      await Promise.all(balancePromises)
        .then(res => {
          const _balances = res
            .filter(token => token && token.balance > 0)
            .sort(sortBalancesById);
          const _balancesEmpty = res.filter(token => token?.balance === 0);
          _balances.push(..._balancesEmpty);
          store.ethBalances = _balances as IEthBalance[];
        })
        .catch(err => {
          err.name && err.message
            ? (store.error = `${err.name}: ${err.message}`)
            : (store.error = DEFAULT_ERROR);
        });

      store.setBatch({
        tokens: tokens,
        searchBalances: zkBalances,
        zkBalances: zkBalances,
        zkBalancesLoaded: true,
        maxConfirmAmount,
      });
      if (accountState?.id) {
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
