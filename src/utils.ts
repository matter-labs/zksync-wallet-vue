import { Web3Provider } from 'ethers/providers';
import { Tx } from './pages/Transactions';

export function getWalletNameFromProvider(): string | undefined {
  const provider = window['ethereum'];
  if (!provider) return;

  if (provider.isTorus) {
    return 'Torus';
  }
  if (provider.isMetaMask) {
    return 'MetaMask';
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
    const trx = await provider.getTransaction(txHash);
    const currentBlock = await provider.getBlockNumber();

    if (typeof trx.blockNumber === 'undefined') return 0;
    return currentBlock - trx.blockNumber;
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
