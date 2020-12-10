import { AccountState, TokenLike, Tokens } from 'zksync/build/types';
import { Provider, Wallet } from 'zksync';
import { BigNumber, ethers } from 'ethers';

import { Store } from 'src/store/store';
import { DEFAULT_ERROR } from 'constants/errors';
import { handleExponentialNumbers, handleFormatToken, loadTokens, sortBalancesById } from 'src/utils';
import { IEthBalance } from 'types/Common';
import { ADDRESS_VALIDATION, INPUT_VALIDATION } from 'constants/regExs';
import { WIDTH_BP } from 'constants/magicNumbers';
import { TransactionStore } from 'src/store/transactionStore';

async function getBalanceOnContract(
  ethSigner: ethers.Signer,
  zksyncProvider: Provider,
  token: TokenLike,
  store: Store,
) {
  const { AccountStore } = store;
  const tokenId = zksyncProvider.tokenSet.resolveTokenId(token);
  if (ethSigner.provider) {
    return await AccountStore.zksContract?.getBalanceToWithdraw(AccountStore.ethSignerAddress, tokenId);
  }
}

export const storeContractBalances = (store: Store) => {
  const { TokensStore, ExternaWalletStore } = store;
  const obj: any = {};
  Promise.all(
    Object.keys(TokensStore.tokens as Tokens).map(key => {
      return getBalanceOnContract(
        store.zkWallet?.ethSigner as ethers.Signer,
        store.zkWallet?.provider as Provider,
        key,
        store,
      ).then(res => {
        if (+res > 0) {
          obj[key] = res;
        }
      });
    }),
  ).then(() => {
    if (JSON.stringify(ExternaWalletStore.externalWalletContractBalances) !== JSON.stringify(obj)) {
      ExternaWalletStore.externalWalletContractBalances = obj;
    }
    ExternaWalletStore.externalWalletContractBalancesLoaded = true;
  });
};

export const getAccState = async (store: Store) => {
  const { zkWallet, TokensStore } = store;
  const { tokens } = TokensStore;


  if (tokens && zkWallet) {
    const _accountState = await zkWallet.getAccountState();
    const at = _accountState.depositing.balances;
    if (JSON.stringify(at) !== JSON.stringify(TokensStore.awaitedTokens)) {
      TokensStore.awaitedTokens = at;
    }
    const zkBalance = _accountState.committed.balances;
    const zkBalancePromises = Object.keys(zkBalance).map(async key => {
      return {
        address: tokens[key].address,
        balance: +handleFormatToken(zkWallet, tokens[key].symbol, zkBalance[key] ? zkBalance[key] : 0),
        symbol: tokens[key].symbol,
        id: tokens[key].id,
      };
    });
    Promise.all(zkBalancePromises)
      .then(res => {
        const _balances = res.slice().sort(sortBalancesById);
        if (JSON.stringify(_balances) !== JSON.stringify(TokensStore.zkBalances)) {
          TokensStore.zkBalances = _balances;
          TokensStore.zkBalancesLoaded = true;
        }
      })
      .catch(err => {
        err.name && err.message ? (store.error = `${err.name}: ${err.message}`) : (store.error = DEFAULT_ERROR);
      });
  }
};

export const handleUnlockNew = async (store: Store, withLoading: boolean) => {
  const { AccountStore, TransactionStore } = store;

  try {
    store.txButtonUnlocked = false;
    if (!store.isBurnerWallet) {
      store.hint = 'Follow the instructions in the pop up';
    }
    if (withLoading) {
      AccountStore.isAccountUnlockingProcess = true;
      TransactionStore.isLoading = true;
    }
    let changePubkey;
    const isSigningKeySet = await store.zkWallet?.isSigningKeySet();
    if (store.zkWallet?.ethSignerType?.verificationMethod === 'ERC-1271') {
      if (!AccountStore.isOnchainAuthSigningKeySet) {
        const onchainAuthTransaction = await store.zkWallet?.onchainAuthSigningKey();
        await onchainAuthTransaction?.wait();
        changePubkey = await store.zkWallet?.setSigningKey({
          feeToken: TransactionStore.symbolName,
          fee: TransactionStore.changePubKeyFees[TransactionStore.symbolName],
          nonce: 'committed',
          onchainAuth: true,
        });
      }
      if (!!AccountStore.isOnchainAuthSigningKeySet && !isSigningKeySet) {
        changePubkey = await store.zkWallet?.setSigningKey({
          feeToken: TransactionStore.symbolName,
          fee: TransactionStore.changePubKeyFees[TransactionStore.symbolName],
          nonce: 'committed',
          onchainAuth: true,
        });
      }
    } else {
      if (!AccountStore.isOnchainAuthSigningKeySet) {
        changePubkey = await store.zkWallet?.setSigningKey({
          feeToken: TransactionStore.symbolName,
          fee: TransactionStore.changePubKeyFees[TransactionStore.symbolName],
        });
      }
    }
    store.hint = 'Confirmed! \n Waiting for transaction to be mined';
    const receipt = await changePubkey?.awaitReceipt();

    store.unlocked = !!receipt;
    if (receipt) {
      store.txButtonUnlocked = true;
    }
    AccountStore.isAccountUnlockingProcess = !receipt;
    TransactionStore.isLoading = !receipt;
  } catch (err) {
    store.error = `${err.name}: ${err.message}`;
    store.txButtonUnlocked = true;
  }
};

export const loadEthTokens = async store => {
  const { TokensStore } = store;

  if (!store.zkWallet || !store.syncProvider || !store.accountState) return;
  const { tokens } = await loadTokens(
    store.syncProvider as Provider,
    store.zkWallet as Wallet,
    store.accountState as AccountState,
  );
  const balancePromises = Object.keys(tokens).map(async key => {
    if (tokens[key].symbol && store.zkWallet) {
      const balance = await store.zkWallet.getEthereumBalance(key);
      return {
        id: tokens[key].id,
        address: tokens[key].address,
        balance: +handleFormatToken(store.zkWallet, tokens[key].symbol, balance || 0),
        symbol: tokens[key].symbol,
      };
    }
  });

  await Promise.all(balancePromises)
    .then(res => {
      const _balances = res.filter(token => token && token.balance > 0).sort(sortBalancesById);

      const _balancesEmpty = res.filter(token => token?.balance === 0).sort(sortBalancesById);
      _balances.push(..._balancesEmpty);
      if (JSON.stringify(_balances) !== JSON.stringify(TokensStore.ethBalances)) {
        TokensStore.ethBalances = _balances as IEthBalance[];
      }
    })
    .catch(err => {
      err.name && err.message ? (store.error = `${err.name}: ${err.message}`) : (store.error = DEFAULT_ERROR);
    });
};

export const validateNumbers = async (store: Store, e, title?: string, max?: boolean, maxValue?: number) => {
  const { TransactionStore, TokensStore } = store;
  const maxBigValue =
    TransactionStore.symbolName &&
    store.zkWallet?.provider.tokenSet.parseToken(
      TransactionStore.symbolName,
      handleExponentialNumbers(TransactionStore.maxValue).toString(),
    );
  if (e.length === 0) {
    TransactionStore.amountShowedValue = e;
  }
  if (INPUT_VALIDATION.digits.test(e)) {
    if (TransactionStore.symbolName) {
      try {
        store.zkWallet?.provider.tokenSet.parseToken(TransactionStore.symbolName, e);
        TransactionStore.amountShowedValue = handleExponentialNumbers(e);
      } catch {
        return;
      }
    } else {
      TransactionStore.amountShowedValue = handleExponentialNumbers(e);
      TransactionStore.amountValue = +e;
      TransactionStore.pureAmountInputValue = e;
      TransactionStore.conditionError = '';
    }
  } else {
    return;
  }
  const amountBigNumber =
    max && maxBigValue && store.zkWallet
      ? +maxBigValue - (TransactionStore.getFeeBasedOnType() ? +TransactionStore.getFeeBasedOnType() : 0)
      : TransactionStore.symbolName &&
        store.zkWallet?.provider.tokenSet.parseToken(TransactionStore.symbolName, e.toString());
  if (
    store.zkWallet &&
    TransactionStore.getFeeBasedOnType() &&
    maxBigValue &&
    amountBigNumber &&
    +maxBigValue - +TransactionStore.getFeeBasedOnType() === +amountBigNumber
  ) {
    const amountBigValue =
      TransactionStore.symbolName && e && store.zkWallet?.provider.tokenSet.parseToken(TransactionStore.symbolName, e);
    TransactionStore.amountBigValue = BigNumber.from(amountBigValue);
    if (TransactionStore.amountBigValue.sub(TransactionStore.getFeeBasedOnType()).gt(0)) {
      if (max) {
        if (title !== 'Transfer') {
          const _amount = handleFormatToken(
            store.zkWallet,
            TransactionStore.symbolName,
            amountBigValue.sub(TransactionStore.getFeeBasedOnType()),
          );
          TransactionStore.amountShowedValue = _amount;
          TransactionStore.amountValue = +_amount;
        }
        if (title === 'Transfer' && TransactionStore.symbolName === TransactionStore.getFeeToken()) {
          TransactionStore.amountShowedValue = handleFormatToken(
            store.zkWallet,
            TransactionStore.symbolName,
            amountBigValue.sub(TransactionStore.getFeeBasedOnType()),
          );
          TransactionStore.amountValue = +TransactionStore.amountShowedValue;
        }
        if (title === 'Transfer' && TransactionStore.symbolName !== TransactionStore.getFeeToken()) {
          TransactionStore.amountShowedValue = e;
          TransactionStore.amountValue = +e;
        }
      } else {
        TransactionStore.conditionError = 'Not enough funds: amount + fee exceeds your balance';
      }
    } else {
      TransactionStore.conditionError = 'Not enough funds: amount + fee exceeds your balance';
    }
  }
  const estimateGas = store.zkWallet && +store.zkWallet?.provider.tokenSet.parseToken('ETH', '0.0002');
  const _eb = TokensStore.ethBalances.filter(balance => balance.symbol === 'ETH')[0]?.balance
    ? TokensStore.ethBalances.filter(b => b.symbol === 'ETH')[0].balance.toString()
    : '0';
  const ethBalance = store.zkWallet?.provider.tokenSet.parseToken('ETH', _eb);
  if (
    title !== 'Transfer' &&
    amountBigNumber &&
    maxBigValue &&
    ((title === 'Deposit' &&
      estimateGas &&
      ((ethBalance && +ethBalance < +estimateGas) || +amountBigNumber > +maxBigValue)) ||
      (title !== 'Deposit' &&
        TransactionStore.getFeeBasedOnType() &&
        (+amountBigNumber + +TransactionStore.getFeeBasedOnType() > +maxBigValue || +amountBigNumber < 0)))
  ) {
    TransactionStore.conditionError = 'Not enough funds: amount + fee exceeds your balance';
  } else if (title === 'Transfer' && store.zkWallet) {
    const formattedFee = handleFormatToken(
      store.zkWallet,
      TransactionStore.getFeeToken(),
      TransactionStore.getFeeBasedOnType(),
    );
    const feeTokenBalance = TokensStore.zkBalances?.filter(
      balance => TransactionStore.getFeeToken() === balance.symbol,
    );
    const _amountBigValue =
      TransactionStore.symbolName &&
      e &&
      store.zkWallet?.provider.tokenSet.parseToken(
        TransactionStore.symbolName,
        TransactionStore.amountValue.toString(),
      );

    const _maxBigValue =
      TransactionStore.symbolName &&
      e &&
      store.zkWallet?.provider.tokenSet.parseToken(TransactionStore.symbolName, TransactionStore.maxValue.toString());
    if (!!TransactionStore.symbolName && maxValue && +TransactionStore.amount > +maxValue) {
      TransactionStore.conditionError = 'Not enough funds: amount + fee exceeds your balance';
    } else if (
      !!TransactionStore.symbolName &&
      _amountBigValue &&
      TransactionStore.getFeeBasedOnType() &&
      _maxBigValue &&
      TransactionStore.symbolName === TransactionStore.getFeeToken() &&
      _amountBigValue.add(TransactionStore.getFeeBasedOnType()).gt(_maxBigValue)
    ) {
      TransactionStore.conditionError = 'Not enough funds: amount + fee exceeds your balance';
    } else if (
      TransactionStore.symbolName !== TransactionStore.getFeeToken() &&
      +formattedFee > +feeTokenBalance[0]?.balance
    ) {
      TransactionStore.conditionError = 'Not enough funds: amount + fee exceeds your balance';
    } else {
      TransactionStore.conditionError = '';
    }
  } else {
    TransactionStore.conditionError = '';
  }
  if (
    title === 'Deposit' &&
    ethBalance &&
    amountBigNumber &&
    maxBigValue &&
    estimateGas &&
    (+ethBalance < +estimateGas || (TransactionStore.symbolName === 'ETH' && +maxBigValue < +amountBigNumber))
  ) {
    TransactionStore.conditionError = 'Not enough ETH to perform a transaction on mainnet';
  }
  if (INPUT_VALIDATION.digits.test(e) && TransactionStore.maxValue && TransactionStore.amountValue) {
    if (!store.zkWallet) return;
    if (title === 'Deposit') {
      const formattedGas = handleFormatToken(store.zkWallet, TransactionStore.symbolName, TransactionStore.gas);
      const _amountBigValue =
        TransactionStore.symbolName &&
        e &&
        store.zkWallet?.provider.tokenSet.parseToken(
          TransactionStore.symbolName,
          TransactionStore.amountValue.toString(),
        );
      if (TransactionStore.symbolName === 'ETH') {
        const _maxBigValue =
          TransactionStore.symbolName &&
          e &&
          store.zkWallet?.provider.tokenSet.parseToken(
            TransactionStore.symbolName,
            TransactionStore.maxValue.toString(),
          );
        const _amountPlusGas = _amountBigValue.add(TransactionStore.gas);

        TransactionStore.amountBigValue = _amountPlusGas.gte(_maxBigValue)
          ? _amountBigValue.sub(TransactionStore.gas)
          : _amountBigValue;
      } else {
        TransactionStore.amountBigValue = _amountBigValue;
      }
    } else {
      TransactionStore.amountBigValue = store.zkWallet.provider.tokenSet.parseToken(
        TransactionStore.symbolName,
        TransactionStore.amountValue.toString(),
      );
    }
  }
};

export const handleInputWidth = async (TransactionStore: TransactionStore, myRef, e, synthetic?) => {
  const el = myRef.current;
  if (el) {
    el.style.minWidth = (window?.innerWidth > WIDTH_BP ? 260 : 120) + 'px';
    el.style.width =
      ((e === TransactionStore.maxValue && e.toString() !== '0') || !!synthetic
        ? e.toString().length
        : el.value.length + 1) + 'ch';
  }
};

/**
 * Common function to calculate time difference
 * @param {number} timeInSec
 * @return {{hours: number, seconds: number, minutes: number}}
 */
export const timeCalc = (timeInSec: number) => {
  const hours = Math.floor(timeInSec / 60 / 60);
  const minutes = Math.floor(timeInSec / 60) - hours * 60;
  const seconds = timeInSec - hours * 60 * 60 - minutes * 60;

  return {
    hours: hours,
    minutes: minutes,
    seconds: seconds,
  };
};
const handleTimeAmount = (time, string) => `${time} ${string}${time > 1 ? 's' : ''}`;

export const timeStempString = ({ hours, minutes, seconds }) => {
  return `${hours ? handleTimeAmount(hours, 'hour') : ''} ${minutes ? handleTimeAmount(minutes, 'minute') : ''} ${
    seconds ? handleTimeAmount(seconds, 'second') : ''
  }`;
};

export const handleFee = (title: string, store: Store, e?, symbol?, address?) => {
  const { TokensStore, TransactionStore, zkWallet, AccountStore } = store;
  const feeType = {
    ChangePubKey: {
      onchainPubkeyAuth: AccountStore.isOnchainAuthSigningKeySet as boolean,
    },
  };

  const symbolProp = TransactionStore.getFeeToken();
  const addressProp = address ? address : TransactionStore.recepientAddress;

  if (!zkWallet || !symbolProp || !addressProp || title === 'Transfer') return;
  if (
    title !== 'Deposit' &&
    (symbolProp || TransactionStore.symbolName) &&
    ADDRESS_VALIDATION['eth'].test(address ? address : TransactionStore.recepientAddress)
  ) {
    TransactionStore.waitingCalculation = true;
    zkWallet?.provider
      .getTransactionFee(title === 'Withdraw' ? 'Withdraw' : 'Transfer', addressProp, symbolProp)
      .then(res => {
        TransactionStore.fee[symbolProp] = res.totalFee;
        TransactionStore.waitingCalculation = false;
      });
  }
  if (title === 'Withdraw') {
    TransactionStore.waitingCalculation = true;
    zkWallet?.provider.getTransactionFee('FastWithdraw', addressProp, symbolProp).then(res => {
      TransactionStore.fastFee = res.totalFee;
      TransactionStore.waitingCalculation = false;
    });
  }

  if (!store.unlocked) {
    zkWallet?.provider
      .getTransactionFee(feeType, zkWallet?.address(), symbolProp)
      .then(res => (TransactionStore.changePubKeyFee = +res.totalFee));
  }
};
