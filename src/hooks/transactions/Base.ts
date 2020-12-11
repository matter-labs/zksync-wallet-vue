import { handleFormatToken, sortBalancesById } from 'src/utils';
import { DEFAULT_ERROR } from 'constants/errors';
import { IEthBalance } from 'types/Common';
import { PriorityOperationReceipt } from 'zksync/build/types';
import { Store } from 'src/store/store';

export const history = (
  store: Store,
  amount: number,
  hash: string | undefined,
  to: string,
  type: string,
  token: string,
) => {
  try {
    const { zkWallet } = store;
    const history = JSON.parse(window.localStorage?.getItem(`history${zkWallet?.address()}`) || '[]');
    const newHistory = JSON.stringify([{ amount, date: new Date(), hash, to, type, token }, ...history]);
    window.localStorage?.setItem(`history${zkWallet?.address()}`, newHistory);
  } catch (err) {
    err.name && err.message ? (store.error = `${err.name}: ${err.message}`) : (store.error = DEFAULT_ERROR);
  }
};

export const transactions = async (store: Store, receipt: PriorityOperationReceipt) => {
  try {
    const { TransactionStore, TokensStore, zkWallet } = store;
    const { tokens } = TokensStore;
    if (receipt && zkWallet && tokens) {
      const _accountState = await zkWallet.getAccountState();
      const zkBalance = _accountState.committed.balances;
      TokensStore.awaitedTokens = _accountState.depositing;
      const zkBalancePromises = Object.keys(zkBalance).map(async key => {
        if (tokens[key]) {
          return {
            address: tokens[key].address,
            balance: +handleFormatToken(zkWallet, tokens[key].symbol, zkBalance[key] ? zkBalance[key] : 0),
            symbol: tokens[key].symbol,
            id: tokens[key].id,
          };
        }
      });
      Promise.all(zkBalancePromises)
        .then(res => {
          TokensStore.zkBalances = res.slice().sort(sortBalancesById) as IEthBalance[];
          TokensStore.zkBalancesLoaded = true;
        })
        .catch(err => {
          err.name && err.message ? (store.error = `${err.name}: ${err.message}`) : (store.error = DEFAULT_ERROR);
        });
      TransactionStore.amountBigValue = 0;
    }

    if (receipt.executed) {
      TransactionStore.isTransactionExecuted = true;
      TransactionStore.isLoading = false;
    }
  } catch (err) {
    err.name && err.message ? (store.error = `${err.name}: ${err.message}`) : (store.error = DEFAULT_ERROR);
  }
};

/**
 * Common errorProcessing handler
 * @param store
 * @param err
 */
export const errorProcessing = (store: Store, err) => {
  const { TransactionStore } = store;
  store.txButtonUnlocked = true;
  if (err.message.match(/(?:denied)/i)) {
    store.hint = err.message;
  } else if (err.name && err.message) {
    store.error = `${err.name}: ${err.message}`;
  } else {
    store.error = DEFAULT_ERROR;
  }
  TransactionStore.isLoading = false;
};
