import { useCallback, useState } from 'react';
import { ethers, Wallet, getDefaultProvider } from 'ethers';

import { useCancelable } from 'hooks/useCancelable';
import {
  portisConnector,
  fortmaticConnector,
  walletConnectConnector,
  burnerWalletConnector,
} from 'components/Wallets/walletConnectors';

import { IEthBalance } from 'types/Common';

import { LINKS_CONFIG } from 'src/config';

import { DEFAULT_ERROR } from 'constants/errors';
import { WSTransport } from 'zksync/build/transport';
import { fetchTransactions } from 'src/api';
import { useLogout } from './useLogout';
import { loadTokens, sortBalancesById } from 'src/utils';
import { useStore } from 'src/store/context';
import { handleFormatToken, checkForEmptyBalance } from 'src/utils';

const useWalletInit = () => {
  const store = useStore();
  const cancelable = useCancelable();

  const connect = useCallback(
    (provider, signUp, prevProviderState?) => {
      store.zkWalletInitializing = true;
      const wCQRScanned = localStorage.getItem('walletconnect');
      if (provider && !store.isMetamaskWallet) {
        signUp()
          .then(async res => {
            store.ethId = res;
            if (!wCQRScanned && store.walletName === 'WalletConnect') {
              store.zkWalletInitializing = false;
            }
            if (store.walletName === 'WalletConnect') {
              store.hint = 'Connected to ';
              if (store.walletName !== 'WalletConnect') {
                store.zkWalletInitializing = false;
              }
            }
            if (store.walletName === 'WalletConnect' && !!prevProviderState) {
              store.hint = 'Connecting to ';
            }
            store.isAccessModalOpen = true;
          })
          .catch(err => {
            if (err.name && err.message) {
              store.error = `${err.name}: ${err.message}`;
            }
            store.walletName = '';
            store.zkWallet = null;
            store.provider = null;
            store.isAccessModalOpen = false;
          });
      } else if (store.isMetamaskWallet) {
        if (!prevProviderState) {
          store.hint = 'Connected to ';
        } else {
          store.hint = 'Connecting to ';
        }
        store.isAccessModalOpen = true;
      } else {
        store.isAccessModalOpen = false;
        store.hint = 'Please install it \n https://metamask.io/';
        store.error = `${store.walletName} not detected`;
      }
    },
    [store],
  );

  const getSigner = useCallback(provider => {
    if (provider && store.walletName !== 'BurnerWallet') {
      const signer = new ethers.providers.Web3Provider(provider).getSigner();
      return signer;
    }
  }, []);

  const logout = useLogout();

  const createWallet = useCallback(async () => {
    try {
      const zkSync = await import('zksync');
      store.zkWalletInitializing = true;

      if (
        !store.provider &&
        store.walletName !== 'Portis' &&
        store.walletName !== 'Fortmatic' &&
        store.walletName !== 'WalletConnect' &&
        store.walletName !== 'BurnerWallet'
      ) {
        store.provider = window['ethereum'];
      } else if (store.walletName === 'Portis') {
        portisConnector(store, connect, getSigner);
      } else if (store.walletName === 'Fortmatic') {
        fortmaticConnector(store, connect, getSigner);
      } else if (store.walletName === 'WalletConnect') {
        walletConnectConnector(store, connect);
      } else if (store.walletName === 'BurnerWallet') {
        burnerWalletConnector(store);
      }
      const provider = store.provider;
      if (
        provider &&
        !provider.selectedAddress &&
        store.walletName !== 'BurnerWallet' &&
        store.walletName !== 'Portis' &&
        store.walletName !== 'WalletConnect' &&
        store.walletName !== 'Fortmatic'
      ) {
        // Could fail, if there's no Metamask in the browser
        if (store.isMetamaskWallet) {
          const _accs = await window['ethereum']?.request({
            method: 'eth_accounts',
          });
          if (!_accs[0]) {
            await store.provider.request({ method: 'eth_requestAccounts' });
          }
        } else {
          window['ethereum'].enable();
        }
        store.hint = 'Connected to ';
      }

      if (
        provider &&
        !provider.selectedAddress &&
        store.walletName !== 'BurnerWallet' &&
        store.walletName !== 'Portis' &&
        store.walletName !== 'Fortmatic'
      ) {
        store.hint = 'Connected to ';
      }

      if (store.walletName === 'BurnerWallet') {
        const burnerWallet = window.localStorage?.getItem('burnerWallet');
        const provider = await getDefaultProvider(LINKS_CONFIG.network);
        if (!!burnerWallet) {
          const walletWithProvider = new Wallet(
            JSON.parse(burnerWallet),
            provider,
          );
          store.ethWallet = walletWithProvider as ethers.Signer;
        } else {
          const randomWallet = await Wallet.createRandom();
          const walletWithProvider = await randomWallet.connect(provider);
          store.ethWallet = walletWithProvider as ethers.Signer;
          window.localStorage?.setItem(
            'burnerWallet',
            JSON.stringify(randomWallet.privateKey),
          );
        }
      }
      const wallet = getSigner(provider);

      if (store.walletName !== 'BurnerWallet') {
        store.ethWallet = wallet;
      }

      const network =
        process.env.ETH_NETWORK === 'localhost' ? 'localhost' : 'testnet';
      const syncProvider = await zkSync.Provider.newWebsocketProvider(
        LINKS_CONFIG.ws_api,
      );
      const syncWallet = await zkSync.Wallet.fromEthSigner(
        (store.walletName === 'BurnerWallet'
          ? store.ethWallet
          : wallet) as ethers.providers.JsonRpcSigner,
        syncProvider,
      );

      const transport = syncProvider.transport as WSTransport;
      const accountState = await syncWallet.getAccountState();
      store.verified = accountState?.verified.balances;
      const maxConfirmAmount = await syncProvider.getConfirmationsForEthOpAmount();

      if (store.isAccessModalOpen) {
        store.setBatch({
          syncProvider: syncProvider,
          syncWallet: syncWallet,
          wsTransport: transport,
          zkWallet: syncWallet,
          accountState,
        });
      }

      const arr = window.localStorage?.getItem(
        `contacts${store.syncWallet?.address()}`,
      );
      if (arr) {
        store.searchContacts = JSON.parse(arr);
      }

      await fetchTransactions(25, 0, syncWallet.address())
        .then(res => (store.transactions = res))
        .catch(err => console.error(err));

      fetch(
        'https://ticker-nhq6ta45ia-ez.a.run.app/cryptocurrency/listings/latest',
        {
          referrerPolicy: 'strict-origin-when-cross-origin',
          body: null,
          method: 'GET',
          mode: 'cors',
        },
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

      const { error, tokens, zkBalances } = await loadTokens(
        syncProvider,
        syncWallet,
        accountState,
      );
      if (error) {
        store.error = error;
      }

      const balancePromises = Object.keys(tokens).map(async key => {
        if (tokens[key].symbol && syncWallet) {
          const balance = await syncWallet.getEthereumBalance(key);
          return {
            id: tokens[key].id,
            address: tokens[key].address,
            balance: +handleFormatToken(
              syncWallet,
              tokens[key].symbol,
              +balance ? +balance : 0,
            ),
            symbol: tokens[key].symbol,
          };
        }
      });

      await Promise.all(balancePromises)
        .then(res => {
          const _balances = res
            .filter(token => token && token.balance > 0)
            .sort(sortBalancesById);
          const _balancesEmpty = res
            .filter(token => token?.balance === 0)
            .sort(sortBalancesById);
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
      await syncWallet
        .getAccountState()
        .then(res => res)
        .then(() => {
          cancelable(store.zkWallet?.isSigningKeySet()).then(data => {
            store.unlocked = data;
          });
        });
      if (accountState?.id) {
        await cancelable(store.zkWallet?.isSigningKeySet()).then(data => {
          store.unlocked = data;
        });
      }

      store.zkWalletInitializing = false;
    } catch (err) {
      store.zkWalletInitializing = false;
      const error = err.message
        ? !!err.message.match(/(?:denied)/i)
        : !!err.match(/(?:denied)/i);
      if (error) {
        logout(false, '');
      }
      store.walletName = '';
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
