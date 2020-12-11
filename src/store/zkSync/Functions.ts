import { Wallet } from 'zksync';
import { BigNumberish } from 'ethers';
import { Transaction } from 'src/store/zkSync/Transaction';

/**
 * Private method exported from dev-version of zkSync.js
 * @param {Wallet} wallet
 * @param {string} actionName
 * @return {Promise<void>}
 */
export const setRequiredAccountIdFromServer = async (wallet: Wallet, actionName: string) => {
  if (wallet.accountId === undefined) {
    const accountIdFromServer = await wallet.getAccountId();
    if (accountIdFromServer == null) {
      throw new Error(`Failed to ${actionName}: Account does not exist in the zkSync network`);
    } else {
      wallet.accountId = accountIdFromServer;
    }
  }
};


/**
 * Generic method for batch transaction creation
 *
 * @param {Wallet} wallet
 * @param {{ethAddress: string, token: string, amount: BigNumberish, fee: BigNumberish, nonce?: number | "committed"}[]} withdrawals
 * @param {{to: string, token: string, amount: BigNumberish, fee: BigNumberish, nonce?: number | "committed"}[]} transfers
 * @throws Error
 * @return {Promise<Transaction[]>}
 */
export const syncMultiTransferWithdrawal = async (
  wallet: Wallet,
  withdrawals: {
    ethAddress: string;
    token: string;
    amount: BigNumberish;
    fee: BigNumberish;
    nonce?: number | 'committed';
  }[],
  transfers: {
    to: string;
    token: string;
    amount: BigNumberish;
    fee: BigNumberish;
    nonce?: number | 'committed';
  }[],
): Promise<Transaction[]> => {
  if (!wallet.signer) {
    throw new Error('ZKSync signer is required for sending zksync transactions.');
  }

  if (transfers.length === 0){
    throw new Error('No transfers in queue');
  }

  await setRequiredAccountIdFromServer(wallet, 'Transfer funds');

  const signedTransactions: any[] = [];

  let nextNonce = transfers[0].nonce != null ? await wallet.getNonce(transfers[0].nonce) : await wallet.getNonce();

  for (let i = 0; i < withdrawals.length; i++) {
    const withdrawal = withdrawals[i];
    const nonce = nextNonce;
    nextNonce += 1;

    const { tx, ethereumSignature } = await wallet.signWithdrawFromSyncToEthereum({
      ...withdrawal,
      nonce,
    }).catch((error) => {
      throw new Error('Error while performing signWithdrawFromSyncToEthereum: '+error.message);
    });

    signedTransactions.push({ tx, signature: ethereumSignature });
  }

  for (let i = 0; i < transfers.length; i++) {
    const transfer = transfers[i];
    const nonce = nextNonce;
    nextNonce += 1;

    const { tx, ethereumSignature } = await wallet.signSyncTransfer({
      ...transfer,
      nonce,
    }).catch((error) => {
      throw new Error('Error while performing signSyncTransfer: '+error.message);
    });

    signedTransactions.push({ tx, signature: ethereumSignature });
  }

  const transactionHashes = await wallet.provider.submitTxsBatch(
    signedTransactions,
  ).catch((error) => {
    throw new Error('Error while performing submitTxsBatch: '+error.message);
  });
  return transactionHashes.map(
    (txHash, idx) =>
      new Transaction(signedTransactions[idx], txHash, wallet.provider),
  );
};
