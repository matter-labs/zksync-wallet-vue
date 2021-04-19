import { GweiBalance, ZkClTransaction } from "@/plugins/types";
import { walletData } from "@/plugins/walletData";
import { accessorType } from "@/store";
import { Transaction } from "zksync/build/wallet";
import { Address, SignedTransaction, TokenSymbol } from "zksync/build/types";

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
): Promise<Transaction | Transaction[] | ZkClTransaction | undefined> => {
  const syncWallet = walletData.get().syncWallet;

  /**
   * @todo: process case when there are 2 transactions
   */
  if (token === feeToken) {
    const transaction = await syncWallet!.syncTransfer({
      to: address,
      token,
      amount: amountBigValue,
      fee: feeBigValue,
    });
    store.transaction.watchTransaction({ transactionHash: transaction.txHash });
    return transaction;
  }
  let nonce: number = (await syncWallet!.getNonce("committed")) as number;
  const transferTx = {
    fee: "0",
    nonce,
    amount: amountBigValue,
    to: address,
    token,
  };
  nonce += 1;
  const feeTx = {
    fee: feeBigValue,
    nonce,
    amount: "0",
    to: syncWallet!.address(),
    token: feeToken,
  };
  const transferTransaction = await syncWallet!.syncMultiTransfer([transferTx, feeTx]);
  for (let a = 0; a < transferTransaction.length; a++) {
    store.transaction.watchTransaction({ transactionHash: transferTransaction[a].txHash });
  }
  return transferTransaction;
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
    const transaction = await syncWallet!.withdrawFromSyncToEthereum({
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

  const signedTransactions: SignedTransaction[] = [];

  const nonce = (await syncWallet!.getNonce()) as number;

  const signedWithdrawTransaction = await syncWallet!.signWithdrawFromSyncToEthereum({
    ...withdrawalTx,
    nonce,
  });

  // @ts-ignore
  signedTransactions.push({ tx: signedWithdrawTransaction!.tx, signature: signedWithdrawTransaction.ethereumSignature });

  // @ts-ignore
  const signTransaction = await syncWallet!.signSyncTransfer({ ...transferTx, nonce: nonce + 1 }).catch((error) => {
    throw new Error("Error while performing signSyncTransfer: " + error.message);
  });

  // @ts-ignore
  signedTransactions.push({ tx: signTransaction.tx, signature: signTransaction.ethereumSignature });

  const transactionHashes = await syncWallet!.provider.submitTxsBatch(signedTransactions).catch((error) => {
    throw new Error("Error while performing submitTxsBatch: " + error.message);
  });

  for (let a = 0; a < transactionHashes.length; a++) {
    if (transactionHashes[a] === undefined) {
      continue;
    }
    store.transaction.watchTransaction({ transactionHash: transactionHashes[a] });
  }
  // @ts-ignore
  return transactionHashes.map((value: string, index: number) => ({ txData: signedTransactions[index], txHash: value }));
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
  const depositResponse = await walletData.get().syncWallet!.depositToSyncFromEthereum({
    depositTo: walletData.get().syncWallet!.address(),
    token,
    amount,
  });
  store.transaction.watchDeposit({ depositTx: depositResponse, tokenSymbol: token, amount });
  return depositResponse;
};
