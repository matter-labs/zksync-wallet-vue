import { ethers } from "ethers";
import walletData from "~/plugins/walletData";

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
  console.log(address, token, feeToken, amount, fees);
  const zksync = await walletData.zkSync();
  let nonce = syncWallet.getNonce("committed");
  const amountBigValue = ethers.BigNumber.from((await zksync.closestPackableTransactionAmount(syncWallet.provider.tokenSet.parseToken(token, amount))).toString());
  const feeBigValue = ethers.BigNumber.from(zksync.closestPackableTransactionFee(syncWallet.provider.tokenSet.parseToken(feeToken, fees).toString())).toString();
  const transferTx = {
    fee: 0,
    nonce,
    amount: amountBigValue,
    to: address,
    token: token,
  };
  nonce += 1;
  const feeTx = {
    to: syncWallet.address(),
    token: feeToken,
    amount: 0,
    fee: feeBigValue,
    nonce,
  };

  /**
   * @todo: process case when there are 2 transactions
   */
  return token === feeToken
    ? syncWallet.syncTransfer({
        to: address,
        token: token,
        amount: amountBigValue,
        fee: feeBigValue,
      })
    : syncWallet.syncMultiTransfer([transferTx, feeTx]);
};
