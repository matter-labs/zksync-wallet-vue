import { ethers } from "ethers";
import walletData from "@/plugins/walletData";

/**
 *
 * @param address
 * @param token
 * @param feeToken
 * @param amount
 * @param fees
 * @return {Promise<Promise<Transaction>|Promise<Transaction[]>>}
 */
export const transaction = async (address, token, feeToken, amount, fees) => {
  const syncWallet = walletData.get().syncWallet;
  const zksync = await walletData.zkSync();
  let nonce = await syncWallet.getNonce("committed");
  const amountBigValue = ethers.BigNumber.from(syncWallet.provider.tokenSet.parseToken(token, amount).toString());
  const feeBigValue = ethers.BigNumber.from(zksync.closestPackableTransactionFee(syncWallet.provider.tokenSet.parseToken(feeToken, fees).toString())).toString();
  const transferTx = {
    fee: 0,
    nonce: nonce,
    amount: amountBigValue,
    to: address,
    token: token,
  };
  nonce += 1;
  const feeTx = {
    fee: feeBigValue,
    nonce: nonce,
    amount: 0,
    to: syncWallet.address(),
    token: feeToken,
  };

  /**
   * @todo: process case when there are 2 transactions
   */
  if (token === feeToken) {
    return await syncWallet.syncTransfer({
      to: address,
      token: token,
      amount: amountBigValue,
      fee: feeBigValue,
    });
  } else {
    const transferTransaction = await syncWallet.syncMultiTransfer([transferTx, feeTx]);
    console.log("transferTransaction", transferTransaction);
    if (transferTransaction) {
      return transferTransaction;
    }
  }
};

/**
 * Generic method for batch transaction creation
 *
 * @param address
 * @param token
 * @param feeToken
 * @param amount
 * @param fastWithdraw
 * @return {Promise<{txData: *, txHash: *}[]>}
 */
export const withdraw = async (address, token, feeToken, amount, fastWithdraw) => {
  const syncWallet = walletData.get().syncWallet;
  const syncProvider = walletData.get().syncProvider;
  const zksync = await walletData.zkSync();
  const amountBigValue = ethers.BigNumber.from(syncWallet.provider.tokenSet.parseToken(token, amount).toString());
  if (token === feeToken) {
    const fee = await syncProvider.getTransactionFee(fastWithdraw ? "FastWithdraw" : "Withdraw", address, feeToken);
    return await syncWallet.withdrawFromSyncToEthereum({
      ethAddress: address,
      token: token,
      amount: amountBigValue,
      fee: zksync.closestPackableTransactionFee(fee.totalFee),
      fastProcessing: !!fastWithdraw,
    });
  } else {
    const batchWithdrawFee = await syncProvider.getTransactionsBatchFee([fastWithdraw ? "FastWithdraw" : "Withdraw", "Transfer"], [address, syncWallet.address()], feeToken);
    const withdrawals = [
      {
        ethAddress: address,
        amount: amountBigValue,
        fee: "0",
        token: token,
      },
    ];
    const transfers = [
      {
        to: syncWallet.address(),
        token: feeToken,
        amount: "0",
        fee: zksync.closestPackableTransactionFee(batchWithdrawFee),
      },
    ];
    if (!syncWallet.signer) {
      throw new Error("zkSync signer is required for sending zksync transactions.");
    } else if (transfers.length === 0) {
      throw new Error("No transfers in queue");
    }

    const signedTransactions = [];
    let signWithdrawTransaction = null;

    let nextNonce = await syncWallet.getNonce();

    for (let i = 0; i < withdrawals.length; i++) {
      const withdrawal = withdrawals[i];
      const nonce = nextNonce;
      nextNonce += 1;

      signWithdrawTransaction = await syncWallet
        .signWithdrawFromSyncToEthereum({
          ...withdrawal,
          nonce,
        })
        .catch((error) => {
          throw new Error("Error while performing signWithdrawFromSyncToEthereum: " + error.message);
        });

      signedTransactions.push({ tx: signWithdrawTransaction.tx, signature: signWithdrawTransaction.ethereumSignature });
    }

    for (let i = 0; i < transfers.length; i++) {
      const transfer = transfers[i];
      const nonce = nextNonce;
      nextNonce += 1;

      const signTransaction = await syncWallet
        .signSyncTransfer({
          ...transfer,
          nonce,
        })
        .catch((error) => {
          throw new Error("Error while performing signSyncTransfer: " + error.message);
        });

      signedTransactions.push({ tx: signTransaction.tx, signature: signTransaction.ethereumSignature });
    }

    const transactionHashes = await syncWallet.provider.submitTxsBatch(signedTransactions).catch((error) => {
      throw new Error("Error while performing submitTxsBatch: " + error.message);
    });
    return transactionHashes.map((txHash, index) => ({
      txData: signedTransactions[index],
      txHash: txHash,
    }));
  }
};
