import { Store } from 'src/store/store';
import { DEFAULT_ERROR } from 'constants/errors';
import { handleFormatToken, sortBalancesById } from 'src/utils';

export const getAccState = async (store: Store) => {
  const { tokens, zkWallet } = store;

  if (tokens && zkWallet) {
    const _accountState = await zkWallet.getAccountState();
    const at = _accountState.depositing.balances;
    if (JSON.stringify(at) !== JSON.stringify(store.awaitedTokens)) {
      store.awaitedTokens = at;
    }
    const zkBalance = _accountState.committed.balances;
    const zkBalancePromises = Object.keys(zkBalance).map(async key => {
      return {
        address: tokens[key].address,
        balance: +handleFormatToken(
          zkWallet,
          tokens[key].symbol,
          zkBalance[key] ? zkBalance[key] : 0,
        ),
        symbol: tokens[key].symbol,
        id: tokens[key].id,
      };
    });
    Promise.all(zkBalancePromises)
      .then(res => {
        const _balances = res.sort(sortBalancesById);
        if (JSON.stringify(_balances) !== JSON.stringify(store.zkBalances)) {
          store.zkBalances = _balances;
          store.zkBalancesLoaded = true;
        }
      })
      .catch(err => {
        err.name && err.message
          ? (store.error = `${err.name}: ${err.message}`)
          : (store.error = DEFAULT_ERROR);
      });
  }
};

export const handleUnlock = async (store: Store, withLoading: boolean) => {
  const { AccountStore, TransactionStore } = store;

  try {
    store.txButtonUnlocked = false;
    if (!store.isBurnerWallet) {
      store.hint = 'Follow the instructions in the pop up';
    }
    if (withLoading === true) {
      AccountStore.isAccountUnlockingProcess = true;
      TransactionStore.isLoading = true;
    }
    let changePubkey;
    const isOnchainAuthSigningKeySet = await store.zkWallet?.isOnchainAuthSigningKeySet();
    const isSigningKeySet = await store.zkWallet?.isSigningKeySet();
    if (store.zkWallet?.ethSignerType?.verificationMethod === 'ERC-1271') {
      if (!isOnchainAuthSigningKeySet) {
        const onchainAuthTransaction = await store.zkWallet?.onchainAuthSigningKey();
        await onchainAuthTransaction?.wait();
        changePubkey = await store.zkWallet?.setSigningKey({
          feeToken: 'ETH',
          fee: 0,
          nonce: 'committed',
          onchainAuth: true,
        });
      }
      if (!!isOnchainAuthSigningKeySet && !isSigningKeySet) {
        changePubkey = await store.zkWallet?.setSigningKey({
          feeToken: 'ETH',
          fee: 0,
          nonce: 'committed',
          onchainAuth: true,
        });
      }
    } else {
      if (!isOnchainAuthSigningKeySet) {
        changePubkey = await store.zkWallet?.setSigningKey({
          feeToken: 'ETH',
          fee: 0,
        });
      }
    }
    store.hint = 'Confirmed! \n Waiting for transaction to be mined';
    const receipt = await changePubkey?.awaitReceipt();

    store.unlocked = !!receipt;
    if (!!receipt) {
      store.txButtonUnlocked = true;
    }
    AccountStore.isAccountUnlockingProcess = !receipt;
    TransactionStore.isLoading = !receipt;
  } catch (err) {
    store.error = `${err.name}: ${err.message}`;
    store.txButtonUnlocked = true;
  }
};

export const handleUnlockNew = async (store: Store, withLoading: boolean) => {
  const { AccountStore, TransactionStore } = store;

  try {
    store.txButtonUnlocked = false;
    if (!store.isBurnerWallet) {
      store.hint = 'Follow the instructions in the pop up';
    }
    if (withLoading === true) {
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
    if (!!receipt) {
      store.txButtonUnlocked = true;
    }
    AccountStore.isAccountUnlockingProcess = !receipt;
    TransactionStore.isLoading = !receipt;
  } catch (err) {
    store.error = `${err.name}: ${err.message}`;
    store.txButtonUnlocked = true;
  }
};
