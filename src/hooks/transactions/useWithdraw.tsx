import { useCallback} from 'react';
import { BigNumberish, ethers} from 'ethers';
import { PriorityOperationReceipt } from 'zksync/build/types';
import { Wallet } from 'zksync';

import { IEthBalance } from 'types/Common';

import { ADDRESS_VALIDATION } from 'constants/regExs';
import { DEFAULT_ERROR } from 'constants/errors';
import { useStore } from 'src/store/context';

import {
  handleFormatToken,
  sortBalancesById,
  addressMiddleCutter,
} from 'src/utils';

import  {
  syncMultiTransferWithdrawal
} from 'src/store/transactionStore';

const TOKEN = 'ETH';

export const useWithdraw = () => {
  const store = useStore();

  const { TokensStore } = store;
  const { tokens } = TokensStore;

  const { walletAddress, zkWallet, TransactionStore } = store;

  /**
   * Common errorProcessing handler
   * @param err
   */
  const errorProcessing = (err) => {
    store.txButtonUnlocked = true;
    if (err.message.match(/(?:denied)/i)) {
      store.hint = err.message;
    } else if (err.name && err.message) {
      store.error = `${err.name}: ${err.message}`;
    } else {
      store.error = DEFAULT_ERROR;
    }
    TransactionStore.isLoading = false;
  }

  const history = useCallback(
          (
                  amount: number,
                  hash: string | undefined,
                  to: string,
                  type: string,
                  token: string,
          ) => {
            try {
              const history = JSON.parse(
                      window.localStorage?.getItem(`history${zkWallet?.address()}`) || '[]',
              );
              const newHistory = JSON.stringify([
                { amount, date: new Date(), hash, to, type, token },
                ...history,
              ]);
              window.localStorage?.setItem(
                      `history${zkWallet?.address()}`,
                      newHistory,
              );
            } catch (err) {
              err.name && err.message ? (store.error = `${err.name}: ${err.message}`) : (store.error = DEFAULT_ERROR);
            }
          },
          [store.error, zkWallet],
  );

  const transactions = useCallback(
          async (receipt: PriorityOperationReceipt) => {
            try {
              if (receipt && zkWallet && tokens) {
                const _accountState = await zkWallet.getAccountState();
                const zkBalance = _accountState.committed.balances;
                TokensStore.awaitedTokens = _accountState.depositing;
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
          },
          [
            TransactionStore.amountValue,
            TransactionStore.isLoading,
            tokens,
            store.zkWallet,
            store.error,
            TokensStore.zkBalances,
            TokensStore.awaitedTokens,
            TokensStore.zkBalancesLoaded,
            TransactionStore.amountBigValue,
            TransactionStore.isTransactionExecuted,
          ],
  );

  const withdraw = useCallback(
          async (address?, type?, symbol = TOKEN) => {
            try {
              const zkSync = await import('zksync');
              const fee = await zkWallet?.provider
                      .getTransactionFee(
                              'Withdraw',
                              TransactionStore.recepientAddress,
                              TransactionStore.symbolName,
                      )
                      .then(res => res.totalFee);
              const fastFee = await zkWallet?.provider
                      .getTransactionFee(
                              'FastWithdraw',
                              TransactionStore.recepientAddress,
                              TransactionStore.symbolName,
                      )
                      .then(res => res.totalFee);
              store.txButtonUnlocked = false;
              if (ADDRESS_VALIDATION['eth'].test(TransactionStore.recepientAddress) && zkWallet && fee && fastFee) {
                TransactionStore.isLoading = true;
                if (!store.isBurnerWallet) store.hint = 'Follow the instructions in the pop up';
                const withdrawTransaction = await zkWallet.withdrawFromSyncToEthereum({
                          ethAddress: TransactionStore.recepientAddress,
                          token: TransactionStore.symbolName,
                          amount: ethers.BigNumber.from(
                                  zkSync
                                          .closestPackableTransactionAmount(
                                                  TransactionStore.amountBigValue,
                                          )
                                          .toString(),
                          ),
                          fee: zkSync.closestPackableTransactionFee(
                                  TransactionStore.fastWithdrawal ? fastFee : fee,
                          ),
                          fastProcessing: TransactionStore.fastWithdrawal,
                        },
                );
                const hash = withdrawTransaction.txHash;
                TransactionStore.transactionHash = hash;
                store.hint = `Waiting for the transaction to be mined.. \n ${+handleFormatToken(
                        zkWallet,
                        TransactionStore.symbolName,
                        TransactionStore.amountBigValue,
                )} \n${hash}`;
                if (!!withdrawTransaction) {
                  store.hint = `Your withdrawal will be processed shortly. \n ${+handleFormatToken(
                          zkWallet,
                          TransactionStore.symbolName,
                          TransactionStore.amountBigValue,
                  )} \n${hash}`;
                }
                const receipt = await withdrawTransaction.awaitReceipt();
                transactions(receipt);
                if (!!receipt) store.txButtonUnlocked = true;
                const verifyReceipt = await withdrawTransaction.awaitVerifyReceipt();
                store.verifyToken = !!verifyReceipt;
              } else {
                store.error = `Address: "${addressMiddleCutter(
                        TransactionStore.recepientAddress,
                        6,
                        6,
                )}" doesn't match ethereum address format`;
              }
            } catch (err) {
              store.txButtonUnlocked = true;
              if (err.message.match(/(?:denied)/i)) {
                store.hint = err.message;
              } else if (err.name && err.message) {
                store.error = `${err.name}: ${err.message}`;
              } else {
                store.error = DEFAULT_ERROR;
              }
              TransactionStore.isLoading = false;
            }
          },
          [
            TransactionStore.amountBigValue,
            TransactionStore.recepientAddress,
            TransactionStore.symbolName,
            history,
            store.error,
            TransactionStore.isLoading,
            store.verifyToken,
            transactions,
            zkWallet,
            store.hint,
            TransactionStore.fastWithdrawal,
            store.zkWallet,
            TokensStore.zkBalances,
            TransactionStore.transactionHash,
            store.isBurnerWallet,
            store.txButtonUnlocked,
          ],
  );


  return {
    withdraw,
  };
};
