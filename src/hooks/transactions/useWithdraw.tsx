import { useCallback } from 'react';
import { BigNumberish, ethers } from 'ethers';

import { ADDRESS_VALIDATION } from 'constants/regExs';
import { useStore } from 'src/store/context';

import { addressMiddleCutter, handleFormatToken } from 'src/utils';

import { errorProcessing, transactions } from 'hooks/transactions/Base';
import { syncMultiTransferWithdrawal } from 'src/store/zkSync/Functions';
import { Wallet } from 'zksync';

export const useWithdraw = () => {
  const store = useStore();

  const { TokensStore } = store;

  const { zkWallet, TransactionStore } = store;

  const withdraw = useCallback(async () => {
    try {
      const zkSync = await import('zksync');
      const fee = await zkWallet?.provider
        .getTransactionFee('Withdraw', TransactionStore.recepientAddress, TransactionStore.withdrawalFeeToken)
        .then(res => res.totalFee);
      const fastFee = await zkWallet?.provider
        .getTransactionFee('FastWithdraw', TransactionStore.recepientAddress, TransactionStore.withdrawalFeeToken)
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

      if (ADDRESS_VALIDATION['eth'].test(TransactionStore.recepientAddress) && zkWallet && fee && fastFee) {
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
        await transactions(store, receipt);
        if (receipt) {
          store.txButtonUnlocked = true;
        }
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
      errorProcessing(store, err);
    }
  }, [
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
  ]);
  // const withdraw = useCallback(
  //         async (address?, type?, symbol = TOKEN) => {
  //           try {
  //             const zkSync = await import('zksync');
  //             const fee = await zkWallet?.provider
  //                     .getTransactionFee(
  //                             'Withdraw',
  //                             TransactionStore.recepientAddress,
  //                             TransactionStore.symbolName,
  //                     )
  //                     .then(res => res.totalFee);
  //             const fastFee = await zkWallet?.provider
  //                     .getTransactionFee(
  //                             'FastWithdraw',
  //                             TransactionStore.recepientAddress,
  //                             TransactionStore.symbolName,
  //                     )
  //                     .then(res => res.totalFee);
  //             store.txButtonUnlocked = false;
  //             if (ADDRESS_VALIDATION.eth.test(TransactionStore.recepientAddress) && zkWallet && fee && fastFee) {
  //               TransactionStore.isLoading = true;
  //               if (!store.isBurnerWallet) store.hint = 'Follow the instructions in the pop up';
  //               const withdrawTransaction = await zkWallet.withdrawFromSyncToEthereum({
  //                         ethAddress: TransactionStore.recepientAddress,
  //                         token: TransactionStore.symbolName,
  //                         amount: ethers.BigNumber.from(
  //                                 zkSync
  //                                         .closestPackableTransactionAmount(
  //                                                 TransactionStore.amountBigValue,
  //                                         )
  //                                         .toString(),
  //                         ),
  //                         fee: zkSync.closestPackableTransactionFee(
  //                                 TransactionStore.fastWithdrawal ? fastFee : fee,
  //                         ),
  //                         fastProcessing: TransactionStore.fastWithdrawal,
  //                       },
  //               );
  //               const hash = withdrawTransaction.txHash;
  //               TransactionStore.transactionHash = hash;
  //               store.hint = `Waiting for the transaction to be mined.. \n ${+handleFormatToken(zkWallet, TransactionStore.symbolName, TransactionStore.amountBigValue)} \n${hash}`;
  //               if (withdrawTransaction) {
  //                 store.hint = `Your withdrawal will be processed shortly. \n ${+handleFormatToken(zkWallet, TransactionStore.symbolName, TransactionStore.amountBigValue)} \n${hash}`;
  //               }
  //               const receipt = await withdrawTransaction.awaitReceipt();
  //               transactions(store, receipt);
  //               if (receipt) store.txButtonUnlocked = true;
  //               const verifyReceipt = await withdrawTransaction.awaitVerifyReceipt();
  //               store.verifyToken = !!verifyReceipt;
  //             } else {
  //               store.error = `Address: "${addressMiddleCutter(
  //                       TransactionStore.recepientAddress,
  //                       6,
  //                       6,
  //               )}" doesn't match ethereum address format`;
  //             }
  //           } catch (err) {
  //             errorProcessing(store, err);
  //           }
  //         },
  //         [
  //           TransactionStore.amountBigValue,
  //           TransactionStore.recepientAddress,
  //           TransactionStore.symbolName,
  //           history,
  //           store.error,
  //           TransactionStore.isLoading,
  //           store.verifyToken,
  //           transactions,
  //           zkWallet,
  //           store.hint,
  //           TransactionStore.fastWithdrawal,
  //           TokensStore.zkBalances,
  //           TransactionStore.transactionHash,
  //           store.isBurnerWallet,
  //           store.txButtonUnlocked,
  //         ],
  // );

  return {
    withdraw,
  };
};
