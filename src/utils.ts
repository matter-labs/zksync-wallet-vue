import ethers, { Contract, getDefaultProvider as getDefaultProviderEthers } from 'ethers';
import { Provider, Wallet } from 'zksync';

import { IEthBalance } from 'types/Common';
import { DEFAULT_ERROR } from 'constants/errors';
import { AccountState, TokenLike, Tokens } from 'zksync/build/types';
import { LINKS_CONFIG } from 'src/config';
import { Store } from './store/store';
import { useCallback } from 'react';



export function getWalletNameFromProvider(): string | undefined {
  const provider: any = window.ethereum;
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

export const handleUnlinkAccount = (store: Store, handleLogout) => {
  if (store.isCoinbaseWallet) {
    store.walletLinkObject.deactivate();
  }
  if (store.isPortisWallet) {
    store.portisObject.logout();
    store.modalSpecifier = '';
    store.modalHintMessage = '';
    store.isAccessModalOpen = false;
    store.walletName = '';
    store.normalBg = false;
    store.portisObject = null;
  }
  if (store.isFortmaticWallet) {
    store.fortmaticObject?.user?.logout();
    store.modalSpecifier = '';
    store.modalHintMessage = '';
    store.isAccessModalOpen = false;
    store.walletName = '';
    store.normalBg = false;
  }
  if (store.isWalletConnect) {
    localStorage.removeItem('walletconnect');
    store.modalHintMessage = '';
    store.modalSpecifier = '';
    handleLogout(false, '');
  }
};

export const useCallbackWrapper = (func, funcArguments, ucbParams) =>
  useCallback(func.bind(null, ...funcArguments), ucbParams);

export const addressMiddleCutter = (address: string, firstNumberOfLetters: number, secondNumberOfLetters: number) => {
  if (address?.length - firstNumberOfLetters - secondNumberOfLetters <= 0) {
    return address;
  }
  return `${address?.substring(0, firstNumberOfLetters)}...${address?.substring(
    address?.length - secondNumberOfLetters,
  )}`;
};

export async function getConfirmationCount(provider: any, txHash: string, maxBlock?: number) {
  // todo: fixme - do not depend on transaction format, use type of transaction
  if (txHash.startsWith('sync-tx')) return 0;
  try {
    const trx = await provider.getTransaction(txHash);
    const currentBlock = await provider.getBlockNumber();
    if (typeof trx.blockNumber === 'undefined') return 0;
    return maxBlock ? maxBlock - currentBlock : currentBlock - trx.blockNumber;
    // return trx.confirmations;
  } catch (error) {
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

export const checkForEmptyBalance = (store: Store, balance) => {
  const tokensWithBalance = balance.filter(el => el.balance > 0);
  if (tokensWithBalance.length > 0) {
    store.TokensStore.isAccountBalanceNotEmpty = true;
    store.TokensStore.isAccountBalanceLoading = false;
  }
  if (!!store.zkWallet && tokensWithBalance.length === 0) {
    store.TokensStore.isAccountBalanceNotEmpty = false;
    store.TokensStore.isAccountBalanceLoading = false;
  }
};

export const sortBalancesById = (a, b) => {
  if (a.id < b.id) {
    return -1;
  }
  if (a.id > b.id) {
    return 1;
  }
  return 0;
};

export const sortBalancesByBalance = (a, b) => {
  if (a.balance > b.balance) {
    return -1;
  }
  if (a.balance < b.balance) {
    return 1;
  }
  return 0;
};

export const mintTestERC20Tokens = async (wallet: Wallet, token: TokenLike, store) => {
  const tokenAddress = wallet?.provider.tokenSet.resolveTokenAddress(token);
  const ABI = [
    {
      constant: false,
      inputs: [
        {
          internalType: 'address',
          name: '_to',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: '_amount',
          type: 'uint256',
        },
      ],
      name: 'mint',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];
  store.zkWallet?.provider.tokenSet.parseToken(token, '100');
  const erc20Mintable = new Contract(tokenAddress, ABI, wallet.ethSigner);
  return await erc20Mintable
    .mint(wallet.address(), store.zkWallet?.provider.tokenSet.parseToken(token, '100'))
    .then(res => {
      store.hint = 'Waiting for transaction to be mined';
      const p = getDefaultProviderEthers(LINKS_CONFIG.network);
      const _int = setInterval(() => {
        p.getTransactionReceipt(res.hash).then(res => {
          if (res) {
            if (store.TransactionStore.withCloseMintModal) {
              store.modalSpecifier = '';
              store.hint = '';
            }
            store.TransactionStore.withCloseMintModal = true;
            clearInterval(_int);
          }
        });
      }, 1000);
      return res;
    })
    .catch(() => (store.modalSpecifier = ''));
};

/**
 * Wrapper around errors from zkSync
 * @param error
 * @return {any}
 */
export const processZkSyncError = error => {
  return error.jrpcError ? error.jrpcError.message : error.message;
};

export const handleFormatToken = (
  wallet: Wallet,
  symbol: string,
  amount: ethers.BigNumberish,
) => {
   if (!amount) return '';
   if (typeof amount === 'number') {
     return wallet?.provider?.tokenSet.formatToken(symbol, amount.toString());
   }
   return wallet?.provider?.tokenSet.formatToken(symbol, amount);
 };

export function getExponentialParts(num) {
  return Array.isArray(num) ? num : String(num).split(/[eE]/);
}

export function isExponential(num) {
  const eParts = getExponentialParts(num);
  return !Number.isNaN(Number(eParts[1]));
}

export function handleExponentialNumbers(num) {
  const eParts = getExponentialParts(num);
  if (!isExponential(eParts)) {
    return eParts[0];
  }

  const sign = eParts[0][0] === '-' ? '-' : '';
  const digits = eParts[0].replace(/^-/, '');
  const digitsParts = digits.split('.');
  const wholeDigits = digitsParts[0];
  const fractionDigits = digitsParts[1] || '';
  let e = Number(eParts[1]);

  if (e === 0) {
    return `${sign + wholeDigits}.${fractionDigits}`;
  } else if (e < 0) {
    // move dot to the left
    const countWholeAfterTransform = wholeDigits.length + e;
    if (countWholeAfterTransform > 0) {
      // transform whole to fraction
      const wholeDigitsAfterTransform = wholeDigits.substr(0, countWholeAfterTransform);
      const wholeDigitsTransformedToFracton = wholeDigits.substr(countWholeAfterTransform);
      return `${sign + wholeDigitsAfterTransform}.${wholeDigitsTransformedToFracton}${fractionDigits}`;
    } else {
      // not enough whole digits: prepend with fractional zeros

      // first e goes to dotted zero
      let zeros = '0.';
      e += 1;
      while (e) {
        zeros += '0';
        e += 1;
      }
      return sign + zeros + wholeDigits + fractionDigits;
    }
  } else {
    // move dot to the right
    const countFractionAfterTransform = fractionDigits.length - e;
    if (countFractionAfterTransform > 0) {
      // transform fraction to whole
      // countTransformedFractionToWhole = e
      const fractionDigitsAfterTransform = fractionDigits.substr(e);
      const fractionDigitsTransformedToWhole = fractionDigits.substr(0, e);
      return `${sign + wholeDigits + fractionDigitsTransformedToWhole}.${fractionDigitsAfterTransform}`;
    } else {
      // not enough fractions: append whole zeros
      let zerosCount = -countFractionAfterTransform;
      let zeros = '';
      while (zerosCount) {
        zeros += '0';
        zerosCount -= 1;
      }
      return sign + wholeDigits + fractionDigits + zeros;
    }
  }
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
  const zkBalance = accountState.committed.balances;

  const balancePromises = Object.entries(tokens)
    .filter(t => t[1].symbol)
    .map(async ([key, value]) => {
      return {
        id: value.id,
        address: value.address,
        balance: +syncWallet?.provider.tokenSet.formatToken(
          value.symbol,
          zkBalance[key] ? zkBalance[key].toString() : '0',
        ),
        symbol: value.symbol,
      };
    });

  const ethBalances: IEthBalance[] = await Promise.all(balancePromises)
    .then(res => {
      const balance = res.filter(token => token);
      return balance as IEthBalance[];
    })
    .catch(err => {
      error = err.name && err.message ? `${err.name}: ${err.message}` : DEFAULT_ERROR;
      return [];
    });

  const zkBalancePromises = Object.keys(zkBalance).map(async key => ({
    address: tokens[key].address,
    balance: +syncWallet?.provider.tokenSet.formatToken(
      tokens[key].symbol,
      zkBalance[key] ? zkBalance[key].toString() : '0',
    ),
    symbol: tokens[key].symbol,
    id: tokens[key].id,
  }));

  const zkBalances: IEthBalance[] = await Promise.all(zkBalancePromises).catch(err => {
    error = err.name && err.message ? `${err.name}: ${err.message}` : DEFAULT_ERROR;
    return [];
  });

  return {
    tokens,
    zkBalances,
    ethBalances,
    error,
  };
}

export const getTimeZone = () => {
  const offset = new Date().getTimezoneOffset();
  const o = offset;
  if (offset < 0) {
    return Math.abs(Math.floor(o / 60));
  } else {
    return -Math.abs(Math.floor(o / 60));
  }
};

export const convertToTimeZoneLocale = (d: Date, timeZoneAmount: number) => {
  return new Date(d.getTime() + timeZoneAmount * 60 * 60 * 1000);
};

export function formatDate(d: Date) {
  return convertToTimeZoneLocale(d, getTimeZone());
}

export const handleGetUTCHours = (d: Date) => {
  const _year = d.getFullYear();
  const _month = d.getMonth();
  const _date = d.getDate();
  const _hour = d.getUTCHours();
  const _minutes = d.getMinutes();
  const _seconds = d.getSeconds();
  return new Date(_year, _month, _date, _hour, _minutes, _seconds);
};

export const intervalAsyncStateUpdater = (
  func,
  funcArguments,
  timeout: number,
  cancelable,
) => {
  cancelable(func(...funcArguments))
    .then(res =>
      setTimeout(
        () =>
          intervalAsyncStateUpdater(func, funcArguments, timeout, cancelable),
        timeout,
      ),
    )
    .catch(err =>
      setTimeout(
        () =>
          intervalAsyncStateUpdater(func, funcArguments, timeout, cancelable),
        timeout,
      ),
    );
};
