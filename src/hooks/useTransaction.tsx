import { useCallback, useState } from 'react';
import { ContractTransaction, ethers, utils } from 'ethers';
import { PriorityOperationReceipt } from 'zksync/build/types';

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

const TOKEN = 'ETH';

export const useTransaction = () => {
  const store = useStore();

  const { TokensStore } = store;
  const { tokens } = TokensStore;

  const { walletAddress, zkWallet, TransactionStore } = store;

  const cancelable = useCancelable();

  // const [addressValue, setAddressValue] = useState<string>(
  //   walletAddress.address ? walletAddress.address : '',
  // );

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
        err.name && err.message
          ? (store.error = `${err.name}: ${err.message}`)
          : (store.error = DEFAULT_ERROR);
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
            };
          });
          Promise.all(zkBalancePromises)
            .then(res => {
              TokensStore.zkBalances = res.sort(
                sortBalancesById,
              ) as IEthBalance[];
              TokensStore.zkBalancesLoaded = true;
            })
            .catch(err => {
              err.name && err.message
                ? (store.error = `${err.name}: ${err.message}`)
                : (store.error = DEFAULT_ERROR);
            });
          TransactionStore.amountBigValue = 0;
        }

        if (receipt.executed) {
          TransactionStore.isTransactionExecuted = true;
          TransactionStore.isLoading = false;
        }
      } catch (err) {
        err.name && err.message
          ? (store.error = `${err.name}: ${err.message}`)
          : (store.error = DEFAULT_ERROR);
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

  const deposit = useCallback(
    async (token = TOKEN) => {
      if (zkWallet) {
        const zkSync = await import('zksync');
        try {
          if (!store.isBurnerWallet)
            store.hint = 'Follow the instructions in the pop up';
          TransactionStore.isLoading = true;
          const handleMax = TokensStore.ethBalances.filter(
            balance => balance.symbol === token || balance.address === token,
          );
          const estimateGas =
            token === '0x0000000000000000000000000000000000000000' &&
            store.zkWallet
              ? +store.zkWallet?.provider.tokenSet.parseToken('ETH', '0.0002')
              : store.zkWallet &&
                +store.zkWallet?.provider.tokenSet.parseToken('ETH', '0.00025');
          const maxBigValue = store.zkWallet?.provider.tokenSet.parseToken(
            token,
            handleMax[0]?.balance.toString(),
          );

          const executeDeposit = async gas => {
            try {
              const depositPriorityOperation = await cancelable(
                !!store.EIP1271Signature //TODO: check what need to pass
                  ? zkWallet.depositToSyncFromEthereum({
                      depositTo: zkWallet.address(),
                      token: token,
                      amount: ethers.BigNumber.from(
                        (
                          await zkSync.closestPackableTransactionAmount(
                            TransactionStore.amountBigValue,
                          )
                        ).toString(),
                      ),
                      approveDepositAmountForERC20: true,
                    })
                  : zkWallet.depositToSyncFromEthereum({
                      depositTo: zkWallet.address(),
                      token: token,
                      amount: ethers.BigNumber.from(
                        (
                          await zkSync.closestPackableTransactionAmount(
                            TransactionStore.amountBigValue,
                          )
                        ).toString(),
                      ),
                    }),
              );
              const hash = depositPriorityOperation.ethTx;
              store.hint = `Waiting for transaction to be mined. \n ${+handleFormatToken(
                zkWallet,
                token,
                TransactionStore.amountBigValue,
              )}  \n${hash.hash}`;
              TransactionStore.transactionHash = hash;
              await depositPriorityOperation
                .awaitEthereumTxCommit()
                .then(res => {
                  store.hint = `Your deposit tx has been mined and will be processed after ${
                    store.maxConfirmAmount
                  } confirmations. Use the link below to track the progress. \n ${+handleFormatToken(
                    zkWallet,
                    token,
                    TransactionStore.amountBigValue,
                  )}  \n${hash.hash}`;
                  TransactionStore.isTransactionExecuted = true;
                });
              const _accountState = await zkWallet.getAccountState();
              TokensStore.awaitedTokens = _accountState.depositing.balances;
              if (Object.keys(TokensStore.awaitedTokens).length > 0) {
                for (const token in TokensStore.awaitedTokens) {
                  const _list = Object.entries(TokensStore.zkBalances).map(
                    el => el[1].symbol,
                  );
                  if (_list.indexOf(token) === -1) {
                    TokensStore.zkBalancesLoaded = true;
                    TokensStore.zkBalances = TokensStore.zkBalances
                      .concat([
                        {
                          symbol: token,
                          balance: 0,
                          address: 'awaited',
                          id: 999,
                        },
                      ])
                      .sort(sortBalancesById);
                  }
                }
              }
            } catch (err) {
              TransactionStore.isLoading = false;
              if (err.message.match(/(?:denied)/i)) {
                store.hint = err.message;
              } else if (err.name && err.message) {
                store.error = `${err.name}: ${err.message}`;
              } else {
                store.error = DEFAULT_ERROR;
              }
            }
          };
          cancelable(
            ethers.getDefaultProvider(LINKS_CONFIG.network).getGasPrice(),
          )
            .then(res => res)
            .then(data => {
              executeDeposit(data);
            });
        } catch (err) {
          TransactionStore.isLoading = false;
          err.name && err.message
            ? (store.error = `${err.name}: ${err.message}`)
            : (store.error = DEFAULT_ERROR);
        }
      }
    },
    [
      TransactionStore.amountBigValue,
      TransactionStore.amountValue,
      TransactionStore.symbolName,
      TransactionStore.transactionHash,
      store.hint,
      history,
      TransactionStore.isLoading,
      transactions,
      zkWallet,
      store.error,
      store.verifyToken,
      TokensStore.awaitedTokens,
      TokensStore.zkBalances,
      store.maxConfirmAmount,
      cancelable,
      TokensStore.ethBalances,
      TokensStore.zkBalancesLoaded,
      TransactionStore.isTransactionExecuted,
      store.EIP1271Signature,
      store.isBurnerWallet,
      store.zkWallet,
    ],
  );

  const transfer = useCallback(
    async (address?, type?, symbol = TOKEN) => {
      try {
        store.txButtonUnlocked = false;
        let nonce = await store.zkWallet?.getNonce('committed');
        if (
          ADDRESS_VALIDATION['eth'].test(TransactionStore.recepientAddress) &&
          zkWallet
        ) {
          TransactionStore.isLoading = true;
          if (!store.isBurnerWallet)
            store.hint = 'Follow the instructions in the pop up';
          const zkSync = await import('zksync');
          if (!nonce) return;
          const transferTx = {
            fee: 0,
            nonce,
            to: TransactionStore.recepientAddress,
            amount: ethers.BigNumber.from(
              (
                await zkSync.closestPackableTransactionAmount(
                  TransactionStore.amountBigValue,
                )
              ).toString(),
            ),
            token: TransactionStore.symbolName,
          };
          nonce += 1;
          const feeTx = {
            to: store.zkWallet?.address() as string,
            token: TransactionStore.transferFeeToken,
            amount: 0,
            fee: TransactionStore.fee[TransactionStore.transferFeeToken],
            nonce,
          };
          const handleTransferTransaction = async () => {
            if (
              TransactionStore.symbolName === TransactionStore.transferFeeToken
            ) {
              const transferTransaction = await zkWallet.syncTransfer({
                to: TransactionStore.recepientAddress,
                token: TransactionStore.symbolName,
                amount: ethers.BigNumber.from(
                  (
                    await zkSync.closestPackableTransactionAmount(
                      TransactionStore.amountBigValue,
                    )
                  ).toString(),
                ),
                fee: TransactionStore.fee[TransactionStore.transferFeeToken],
              });
              if (!!transferTransaction) return transferTransaction;
            } else {
              const transferTransaction = await store.zkWallet?.syncMultiTransfer(
                [transferTx, feeTx],
              );
              if (!!transferTransaction) return transferTransaction[0];
            }
          };
          const transferTransaction = await handleTransferTransaction();
          if (!transferTransaction) return;

          const hash = transferTransaction.txHash;
          TransactionStore.transactionHash = hash;
          store.hint = ` \n ${+handleFormatToken(
            zkWallet,
            TransactionStore.symbolName,
            TransactionStore.amountBigValue,
          )}. \n${hash}`;
          const receipt = await transferTransaction.awaitReceipt();
          transactions(receipt);
          if (!!receipt) store.txButtonUnlocked = true;
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
        if (
          ADDRESS_VALIDATION['eth'].test(TransactionStore.recepientAddress) &&
          zkWallet &&
          fee &&
          fastFee
        ) {
          TransactionStore.isLoading = true;
          if (!store.isBurnerWallet)
            store.hint = 'Follow the instructions in the pop up';
          ethers.BigNumber;
          const withdrawTransaction = await zkWallet.withdrawFromSyncToEthereum(
            {
              ethAddress: TransactionStore.recepientAddress,
              token: TransactionStore.symbolName,
              amount: ethers.BigNumber.from(
                (
                  await zkSync.closestPackableTransactionAmount(
                    TransactionStore.amountBigValue,
                  )
                ).toString(),
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
    deposit,
    transfer,
    withdraw,
  };
};
