import { walletData } from "@/plugins/walletData";
import { accessorType } from "@/store";
import { ETHOperation, submitSignedTransactionsBatch, Transaction, Wallet } from "zksync/build/wallet";
import { Address, SignedTransaction, TokenSymbol, TotalFee, TxEthSignature } from "zksync/build/types";
import { addCPKToBatch } from "@/plugins/walletActions/cpk";
import { BatchBuilder } from "zksync/build/batch-builder";
import { GweiBalance } from "~/types/lib";

/**
 * Make zkSync transaction
 *
 * @param {Address} address
 * @param {TokenSymbol} token
 * @param {TokenSymbol} feeToken
 * @param {GweiBalance} amountBigValue
 * @param {GweiBalance} feeBigValue
 * @param store
 * @param accountActivationFee
 * @returns {Promise<Transaction[]>}
 */
export const transaction = async (
  address: Address,
  token: TokenSymbol,
  feeToken: TokenSymbol,
  amountBigValue: GweiBalance,
  feeBigValue: GweiBalance,
  store: typeof accessorType,
  accountActivationFee?: GweiBalance,
) => {
  const syncWallet = walletData.get().syncWallet;
  const nonce = await syncWallet!.getNonce("committed");
  const batchBuilder = syncWallet!.batchBuilder(nonce);

  if (store.wallet.isAccountLocked) {
    if (!accountActivationFee) {
      throw new Error("No account activation fee found");
    }
    await addCPKToBatch(syncWallet!, accountActivationFee, feeToken, batchBuilder, store);
  }
  if (token === feeToken) {
    batchBuilder.addTransfer({
      to: address,
      token,
      amount: amountBigValue,
      fee: feeBigValue,
    });
  } else {
    batchBuilder.addTransfer({
      fee: "0",
      amount: amountBigValue,
      to: address,
      token,
    });
    batchBuilder.addTransfer({
      fee: feeBigValue,
      amount: "0",
      to: syncWallet!.address(),
      token: feeToken,
    });
  }
  const batchTransactionData: { txs: SignedTransaction[]; signature: TxEthSignature; totalFee: TotalFee } = await batchBuilder.build();
  const transactions: Transaction[] = await submitSignedTransactionsBatch(syncWallet!.provider, batchTransactionData.txs, [batchTransactionData.signature]);
  for (const tx of transactions) {
    store.transaction.watchTransaction({ transactionHash: tx.txHash }).then((r) => {});
  }
  return labelTransactions(transactions);
};

interface WithdrawParams {
  address: Address;
  token: TokenSymbol;
  feeToken: TokenSymbol;
  amount: GweiBalance;
  fastWithdraw: boolean;
  fee: GweiBalance;
  accountActivationFee?: GweiBalance;
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
 * @param fee
 * @param accountActivationFee
 * @param store
 * @return {Promise<{txData: *, txHash: *}[]>}
 */
export const withdraw = async ({
  address,
  token,
  feeToken,
  amount,
  fastWithdraw,
  fee,
  accountActivationFee,
  store,
}: WithdrawParams): Promise<{ cpkTransaction: null | Transaction; feeTransaction: Transaction | null; transaction: Transaction | null }> => {
  const syncWallet: Wallet | undefined = walletData.get().syncWallet;
  const nonce: number = await syncWallet!.getNonce("committed");
  const batchBuilder: BatchBuilder = syncWallet!.batchBuilder(nonce);

  if (store.wallet.isAccountLocked) {
    if (!accountActivationFee) {
      throw new Error("No account activation fee found");
    }
    await addCPKToBatch(syncWallet!, accountActivationFee, feeToken, batchBuilder, store);
  }
  if (token === feeToken) {
    batchBuilder.addWithdraw({
      ethAddress: address,
      fastProcessing: fastWithdraw,
      token,
      amount,
      fee,
    });
  } else {
    batchBuilder.addWithdraw({
      fee: "0",
      amount,
      ethAddress: address,
      fastProcessing: fastWithdraw,
      token,
    });
    batchBuilder.addTransfer({
      fee,
      amount: "0",
      to: syncWallet!.address(),
      token: feeToken,
    });
  }
  const batchTransactionData = await batchBuilder.build();
  const transactions = await submitSignedTransactionsBatch(syncWallet!.provider, batchTransactionData.txs, [batchTransactionData.signature]);
  for (const tx of transactions) {
    store.transaction.watchTransaction({ transactionHash: tx.txHash }).then((r) => {});
  }
  return labelTransactions(transactions);
};

export const labelTransactions = (transactions: Transaction[]) => {
  let transaction: Transaction | null = null;
  let feeTransaction: Transaction | null = null;
  let cpkTransaction: Transaction | null = null;
  for (const tx of transactions) {
    if (tx.txData.tx.type === "ChangePubKey") {
      cpkTransaction = tx;
      continue;
    }
    if (tx.txData.tx.fee === "0") {
      transaction = tx;
    } else if (tx.txData.tx.amount === "0") {
      feeTransaction = tx;
    }
  }
  if (!transaction) {
    for (const tx of transactions) {
      if (tx.txData.tx.type !== "ChangePubKey") {
        transaction = tx;
      }
    }
  }
  if (!feeTransaction) {
    feeTransaction = transaction;
  }
  return {
    transaction,
    feeTransaction,
    cpkTransaction,
  };
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
  const depositResponse: ETHOperation = await walletData.get().syncWallet!.depositToSyncFromEthereum({
    depositTo: walletData.get().syncWallet!.address(),
    token,
    amount,
  });
  store.transaction.watchDeposit({ depositTx: depositResponse, tokenSymbol: token, amount }).then((r) => {});
  return depositResponse;
};
