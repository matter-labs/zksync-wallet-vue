import { AccountState, TokenLike, Tokens } from 'zksync/build/types';
import { Provider, Wallet } from 'zksync';
import { ethers } from 'ethers';

import { Store } from 'src/store/store';
import { DEFAULT_ERROR } from 'constants/errors';
import { handleFormatToken, loadTokens, sortBalancesById } from 'src/utils';
import { IEthBalance } from 'types/Common';

async function getBalanceOnContract(
  ethSigner: ethers.Signer,
  zksyncProvider: Provider,
  token: TokenLike,
  store: Store,
) {
  const { AccountStore } = store;
  const tokenId = zksyncProvider.tokenSet.resolveTokenId(token);
  if (ethSigner.provider) {
    return await AccountStore.zksContract?.getBalanceToWithdraw(
      AccountStore.ethSignerAddress,
      tokenId,
    );
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
    if (
      JSON.stringify(ExternaWalletStore.externalWalletContractBalances) !==
      JSON.stringify(obj)
    ) {
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
        const _balances = res.slice().sort(sortBalancesById);
        if (
          JSON.stringify(_balances) !== JSON.stringify(TokensStore.zkBalances)
        ) {
          TokensStore.zkBalances = _balances;
          TokensStore.zkBalancesLoaded = true;
        }
      })
      .catch(err => {
        err.name && err.message
          ? (store.error = `${err.name}: ${err.message}`)
          : (store.error = DEFAULT_ERROR);
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
        balance: +handleFormatToken(
          store.zkWallet,
          tokens[key].symbol,
          balance ? balance : 0,
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
      if (
        JSON.stringify(_balances) !== JSON.stringify(TokensStore.ethBalances)
      ) {
        TokensStore.ethBalances = _balances as IEthBalance[];
      }
    })
    .catch(err => {
      err.name && err.message
        ? (store.error = `${err.name}: ${err.message}`)
        : (store.error = DEFAULT_ERROR);
    });
};
