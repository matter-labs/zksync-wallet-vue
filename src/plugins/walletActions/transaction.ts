import { GweiBalance, ZkClTransaction } from "@/plugins/types";
import { walletData } from "@/plugins/walletData";
import { accessorType } from "@/store";
import { ETHOperation, Transaction } from "zksync/build/wallet";
import { Address, SignedTransaction, TokenSymbol } from "zksync/src/types";

/**
 * Make zkSync transaction
 *
 * @param {Address} address
 * @param {TokenSymbol} token
 * @param {TokenSymbol} feeToken
 * @param {GweiBalance} amountBigValue
 * @param {GweiBalance} feeBigValue
 * @param store
 * @returns {Promise<Transaction | ZkClTransaction | undefined>}
 */
export const transaction = async (
  address: Address,
  token: TokenSymbol,
  feeToken: TokenSymbol,
  amountBigValue: GweiBalance,
  feeBigValue: GweiBalance,
  store: typeof accessorType,
): Promise<Transaction | ZkClTransaction | undefined> => {
  const syncWallet = walletData.get().syncWallet;
  let nonce: number = (await syncWallet?.getNonce("committed")) as number;
  const transferTx = {
    fee: 0,
    nonce,
    amount: amountBigValue,
    to: address,
    token,
  };
  nonce += 1;

  /**
   * @todo: process case when there are 2 transactions
   */
  if (token === feeToken) {
    const transaction: Transaction | undefined = await syncWallet?.syncTransfer({
      to: address,
      token,
      amount: amountBigValue,
      fee: feeBigValue,
    });
    store.transaction.watchTransaction({ transactionHash: transaction?.txHash });
    return transaction;
  }
  const transferTransaction: Transaction[] | undefined = await syncWallet?.syncMultiTransfer([transferTx]);
  if (transferTransaction !== undefined) {
    for (let a = 0; a < transferTransaction.length; a++) {
      store.transaction.watchTransaction({ transactionHash: transferTransaction[a].txHash });
    }
  }
  return transferTransaction?.shift();
};

interface WithdrawParams {
  address: Address;
  token: TokenSymbol;
  feeToken: TokenSymbol;
  amount: GweiBalance;
  fastWithdraw: boolean;
  fees: GweiBalance;
  store: typeof accessorType;
}

/**
 * Generic method for batch transaction creation
 *
 * @param address
 * @param token
 * @param feeToken
 * @param amount
 * @param fastWithdraw
 * @param fees
 * @param store
 * @return {Promise<{txData: *, txHash: *}[]>}
 */
export const withdraw = async ({ address, token, feeToken, amount, fastWithdraw, fees, store }: WithdrawParams): Promise<Transaction> => {
  const syncWallet = walletData.get().syncWallet;
  const amountBigValue = amount;
  const feeBigValue = fees;
  if (token === feeToken) {
    const transaction: Transaction | undefined = await syncWallet!.withdrawFromSyncToEthereum({
      ethAddress: address,
      token,
      amount: amountBigValue,
      fee: feeBigValue,
      fastProcessing: fastWithdraw,
    });
    store.transaction.watchTransaction({ transactionHash: transaction?.txHash });
    return transaction;
  }
  const withdrawalTx = {
    ethAddress: address,
    amount: amountBigValue,
    fee: "0",
    token,
  };
  const transferTx = {
    to: syncWallet?.address(),
    token: feeToken,
    amount: "0",
    fee: feeBigValue,
  };

  // @ts-ignore
  const signedTransactions: SignedTransaction[] = [];

  const nonce: number = (await syncWallet?.getNonce()) as number;

  const signedWithdrawTransaction: SignedTransaction | undefined = await syncWallet?.signWithdrawFromSyncToEthereum({
    ...withdrawalTx,
    nonce,
  });
  // @ts-ignore

  signedTransactions.push({ tx: signedWithdrawTransaction.tx, signature: signedWithdrawTransaction.ethereumSignature });

  // @ts-ignore
  const signTransaction: SignedTransaction | undefined = await syncWallet?.signSyncTransfer({ ...transferTx, nonce: nonce + 1 }).catch((error) => {
    throw new Error("Error while performing signSyncTransfer: " + error.message);
  });

  // @ts-ignore
  signedTransactions.push({ tx: signTransaction.tx, signature: signTransaction.ethereumSignature });

  const transactionHashes: string[] | SignedTransaction[] | undefined = await syncWallet?.provider.submitTxsBatch(signedTransactions as SignedTransaction[]).catch((error) => {
    throw new Error("Error while performing submitTxsBatch: " + error.message);
  });

  // @ts-ignore
  if (transactionHashes !== undefined) {
    for (let a = 0; a < transactionHashes.length; a++) {
      if (transactionHashes[a] === undefined) {
        continue;
      }
      store.transaction.watchTransaction({ transactionHash: transactionHashes[a] });
    }
  }
  return transactionHashes?.map((value: string, index: number) => ({ txData: signedTransactions[index], txHash: value }));
};

/**
 * Deposit action method
 *
 * @param {TokenSymbol} token
 * @param {GweiBalance} amount
 * @param store
 * @returns {Promise<any>}
 */
export const deposit = async (token: TokenSymbol, amount: GweiBalance, store: typeof accessorType) => {
  const depositResponse: ETHOperation | undefined = await walletData.get().syncWallet?.depositToSyncFromEthereum({
    depositTo: walletData.get().syncWallet?.address() as string,
    token,
    amount,
  });
  // @ts-ignore
  store.transaction.watchDeposit({ depositTx: depositResponse, tokenSymbol: token, amount });
  return depositResponse;
};
