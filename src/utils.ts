import { Web3Provider } from 'ethers/providers';
import { Provider, Wallet } from 'zksync';
import { IEthBalance } from './types/Common';
import { DEFAULT_ERROR } from './constants/errors';
import { Tokens, AccountState } from 'zksync/build/types';

export function getWalletNameFromProvider(): string | undefined {
  const provider = window['ethereum'];
  if (!provider) return;

  if (provider.isTorus) {
    return 'Torus';
  }
  if (provider.isMetaMask) {
    return 'Metamask';
  }
  if (provider.isDapper) {
    return 'Dapper';
  }
  if (provider.isWalletConnect) {
    return 'WalletConnect';
  }
  if (provider.isTrust) {
    return 'Trust';
  }
  if (provider.isCoinbaseWallet) {
    return 'Coinbase';
  }
  if (provider.isToshi) {
    return 'Toshi';
  }
  if (provider.isCipher) {
    return 'Cipher';
  }
  if (provider.isOpera) {
    return 'Opera';
  }
  if (provider.isStatus) {
    return 'Status';
  }
  if (provider.host && provider.host.indexOf('localhost') !== -1) {
    return 'localhost';
  }
}

export async function getConfirmationCount(
  provider: Web3Provider,
  txHash: string,
) {
  try {
    const trx = await provider.getTransaction(txHash.replace('sync-tx:', ''));
    const currentBlock = await provider.getBlockNumber();

    if (typeof trx.blockNumber === 'undefined') return 0;
    return currentBlock - trx.blockNumber;
    // return trx.confirmations;
  } catch (error) {
    console.error('Confirmation count error', error);
    return 0;
  }
}

export function getCookie(name: string) {
  const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (m) return m[2];
}

export function setCookie(name: string, value, exp?: Date) {
  let val = `${name}=${value}`;
  if (exp) {
    val += `; Expires=${exp.toUTCString()}`;
  }
  document.cookie = val;
}

export function whyDidYouUpdate() {
  const prevFields = {};
  return fields => {
    const eqCheck = {};
    for (const k in fields) {
      if (!(k in prevFields) || prevFields[k] !== fields[k]) {
        eqCheck[k] = false;
      } else {
        eqCheck[k] = true;
      }
      prevFields[k] = fields[k];
    }
    console.log(eqCheck);
  };
}

export async function loadTokens(
  syncProvider: Provider,
  syncWallet: Wallet,
  accountState: AccountState,
): Promise<{
  tokens: Tokens;
  zkBalances: IEthBalance[];
  ethBalances: IEthBalance[];
  error?: string;
}> {
  if (!syncProvider || !syncWallet) {
    return { tokens: {}, ethBalances: [], zkBalances: [], error: undefined };
  }
  const tokens = await syncProvider.getTokens();
  let error: string | undefined;
  const zkBalance = (await syncWallet.getAccountState()).committed.balances;

  const balancePromises = Object.entries(tokens)
    .filter(t => t[1].symbol)
    .map(async ([key, value]) => {
      return {
        address: value.address,
        balance: +zkBalance[key] / Math.pow(10, 18),
        symbol: value.symbol,
      };
    });

  const ethBalances: IEthBalance[] = await Promise.all(balancePromises)
    .then(res => {
      const balance = res.filter(token => token);
      return balance as IEthBalance[];
    })
    .catch(err => {
      error =
        err.name && err.message ? `${err.name}: ${err.message}` : DEFAULT_ERROR;
      return [];
    });

  const zkBalancePromises = Object.keys(zkBalance).map(async key => ({
    address: tokens[key].address,
    balance: +zkBalance[key] / Math.pow(10, 18),
    symbol: tokens[key].symbol,
  }));

  const zkBalances: IEthBalance[] = await Promise.all(zkBalancePromises).catch(
    err => {
      error =
        err.name && err.message ? `${err.name}: ${err.message}` : DEFAULT_ERROR;
      return [];
    },
  );

  return {
    tokens,
    zkBalances,
    ethBalances,
    error,
  };
}
