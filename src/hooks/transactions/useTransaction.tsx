import { useCallback } from 'react';
import { BigNumberish, ethers} from 'ethers';
import { PriorityOperationReceipt } from 'zksync/build/types';
import { Wallet } from 'zksync';

import { IEthBalance } from 'types/Common';

import { ADDRESS_VALIDATION } from 'constants/regExs';
import { DEFAULT_ERROR } from 'constants/errors';
import { useCancelable } from 'hooks/useCancelable';
import { useStore } from 'src/store/context';
import { LINKS_CONFIG } from 'src/config';

import {
  handleFormatToken,
  sortBalancesById,
  addressMiddleCutter,
} from 'src/utils';


import  {
  syncMultiTransferWithdrawal
} from 'src/store/transactionStore';


const TOKEN = 'ETH';

export const useTransaction = () => {
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

  const cancelable = useCancelable();

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


  const transfer = useCallback(
    async (address?, type?, symbol = TOKEN) => {
      try {
        store.txButtonUnlocked = false;
        let nonce = await store.zkWallet?.getNonce('committed');
        if (ADDRESS_VALIDATION.eth.test(TransactionStore.recepientAddress) && zkWallet) {
          TransactionStore.isLoading = true;
          if (!store.isBurnerWallet) store.hint = 'Follow the instructions in the pop up';
          const zkSync = await import('zksync');
          if (!nonce) return;
          const amountBigValue =
            TransactionStore.symbolName &&
            TransactionStore.amountShowedValue &&
            store.zkWallet?.provider.tokenSet.parseToken(
              TransactionStore.symbolName,
              TransactionStore.amountShowedValue,
            );
          if (!amountBigValue) return;
          const transferTx = {
            fee: 0,
            nonce,
            to: TransactionStore.recepientAddress,
            amount: ethers.BigNumber.from(
              zkSync
                .closestPackableTransactionAmount(amountBigValue)
                .toString(),
            ),
            token: TransactionStore.symbolName,
          };
          nonce += 1;
          const feeTx = {
            to: store.zkWallet?.address() as string,
            token: TransactionStore.transferFeeToken,
            amount: 0,
            fee: zkSync.closestPackableTransactionFee(
              TransactionStore.fee[TransactionStore.transferFeeToken],
            ),
            nonce,
          };
          const handleTransferTransaction = async () => {
            if (TransactionStore.symbolName === TransactionStore.transferFeeToken) {
              const transferTransaction = await zkWallet.syncTransfer({
                to: TransactionStore.recepientAddress,
                token: TransactionStore.symbolName,
                amount: ethers.BigNumber.from(
                  (
                    await zkSync.closestPackableTransactionAmount(
                      amountBigValue,
                    )
                  ).toString(),
                ),
                fee: zkSync.closestPackableTransactionFee(
                  TransactionStore.fee[TransactionStore.transferFeeToken],
                ),
              });
              if (transferTransaction) return transferTransaction;
            } else {
              const transferTransaction = await store.zkWallet?.syncMultiTransfer(
                [transferTx, feeTx],
              );
              if (transferTransaction) return transferTransaction[0];
            }
          };
          const transferTransaction = await handleTransferTransaction();
          if (!transferTransaction) return;

          const hash = transferTransaction.txHash;
          TransactionStore.transactionHash = hash;
          store.hint = ` \n ${+handleFormatToken(
            zkWallet,
            TransactionStore.symbolName,
            amountBigValue,
          )}. \n${hash}`;
          const receipt = await transferTransaction.awaitReceipt();
          transactions(receipt);
          if (receipt) store.txButtonUnlocked = true;
          const verifyReceipt = await transferTransaction.awaitVerifyReceipt();
          store.verifyToken = !!verifyReceipt;
        } else {
          store.error = `Address: "${addressMiddleCutter(
            TransactionStore.recepientAddress,
            6,
            6,
          )}" doesn't match ethereum address format`;
        }
      } catch (err) {
        errorProcessing(err);
      }
    },
    [
      TransactionStore.recepientAddress,
      TransactionStore.amountBigValue,
      TransactionStore.transactionHash,
      TransactionStore.symbolName,
      history,
      store.verifyToken,
      store.error,
      store.hint,
      transactions,
      zkWallet,
      TokensStore.zkBalances,
      TransactionStore.fee,
      TransactionStore.isLoading,
      TransactionStore.transferFeeToken,
      store.isBurnerWallet,
      store.txButtonUnlocked,
      store.zkWallet,
    ],
  );

  const withdraw = useCallback(
    async (address?, type?, symbol = TOKEN, feeSymbol = TOKEN) => {
      try {
        const zkSync = await import('zksync');
        const fee = await zkWallet?.provider
          .getTransactionFee('Withdraw', TransactionStore.recepientAddress, TransactionStore.withdrawalToken)
          .then(res => res.totalFee);
        const fastFee = await zkWallet?.provider
          .getTransactionFee('FastWithdraw', TransactionStore.recepientAddress, TransactionStore.withdrawalToken)
          .then(res => res.totalFee);
        store.txButtonUnlocked = false;

        // We already get the total fee
        const batchWithdrawFee = TransactionStore.withdrawalFeeToken
          ? await zkWallet?.provider.getTransactionsBatchFee(
              ['Withdraw', 'Transfer'],
              [TransactionStore.recepientAddress, zkWallet?.address()],
              TransactionStore.withdrawalFeeToken,
            )
          : undefined;

        if (ADDRESS_VALIDATION.eth.test(TransactionStore.recepientAddress) && zkWallet && fee && fastFee) {
          TransactionStore.isLoading = true;
          if (!store.isBurnerWallet) store.hint = 'Follow the instructions in the pop up';

          let withdrawTransaction;

          // If there is no withdraw token or if it is the same as the main
          // one, there should be only one transaction to allow fast processing
          if (
            !TransactionStore.withdrawalFeeToken ||
            TransactionStore.withdrawalFeeToken === TransactionStore.withdrawalToken
          ) {
            withdrawTransaction = await zkWallet.withdrawFromSyncToEthereum({
              ethAddress: TransactionStore.recepientAddress,
              token: TransactionStore.withdrawalToken,
              amount: ethers.BigNumber.from(
                zkSync.closestPackableTransactionAmount(TransactionStore.amountBigValue).toString(),
              ),
              fee: zkSync.closestPackableTransactionFee(TransactionStore.fastWithdrawal ? fastFee : fee),
              fastProcessing: TransactionStore.fastWithdrawal,
            });
          } else {
            const [withdrawTx, _] = await syncMultiTransferWithdrawal(
              store.zkWallet as Wallet,
              [
                {
                  ethAddress: TransactionStore.recepientAddress,
                  amount: zkSync.closestPackableTransactionAmount(TransactionStore.withdrawalAmount),
                  fee: '0',
                  token: TransactionStore.withdrawalToken,
                },
              ],
              [
                {
                  to: store.zkWallet!.address(),
                  token: TransactionStore.withdrawalFeeToken,
                  amount: '0',
                  fee: zkSync.closestPackableTransactionFee(batchWithdrawFee as BigNumberish),
                },
              ],
            );

            withdrawTransaction = withdrawTx;
          }
          const hash = withdrawTransaction.txHash;
          TransactionStore.transactionHash = hash;
          store.hint = `Waiting for the transaction to be mined.. \n ${+handleFormatToken(
            zkWallet,
            TransactionStore.withdrawalToken,
            TransactionStore.amountBigValue,
          )} \n${hash}`;
          if (withdrawTransaction) {
            store.hint = `Your withdrawal will be processed shortly. \n ${+handleFormatToken(
              zkWallet,
              TransactionStore.withdrawalToken,
              TransactionStore.amountBigValue,
            )} \n${hash}`;
          }
          const receipt = await withdrawTransaction.awaitReceipt();
          transactions(receipt);
          if (receipt) store.txButtonUnlocked = true;
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
      TransactionStore.withdrawalFeeAmount,
      TransactionStore.withdrawalFeeToken,
      TransactionStore.withdrawalToken,
      TransactionStore.withdrawalAmount,
    ],
  );

  return {
    transfer
  };
};
