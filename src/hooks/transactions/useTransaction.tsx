import { useCallback } from 'react';
import { ethers} from 'ethers';
import { ADDRESS_VALIDATION } from 'constants/regExs';
import { useStore } from 'src/store/context';

import {
  handleFormatToken,
  addressMiddleCutter,
} from 'src/utils';

import { errorProcessing, transactions } from 'hooks/transactions/Base';


const TOKEN = 'ETH';

export const useTransaction = () => {
  const store = useStore();

  const { TokensStore } = store;

  const { zkWallet, TransactionStore } = store;

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
          store.hint = ` \n ${+handleFormatToken(zkWallet, TransactionStore.symbolName, amountBigValue)}. \n${hash}`;
          const receipt = await transferTransaction.awaitReceipt();
          transactions(store, receipt);
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
        errorProcessing(store, err);
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
  return {
    transfer
  };
};
