import { GweiBalance } from "@/plugins/types";
import { walletData } from "@/plugins/walletData";
import { accessorType } from "@/store";
import { submitSignedTransactionsBatch } from "zksync/build/wallet";
import { Address, TokenSymbol } from "zksync/build/types";

/**
 * Make zkSync transaction
 *
 * @param {Address} address
 * @param {TokenSymbol} token
 * @param {TokenSymbol} feeToken
 * @param {GweiBalance} amountBigValue
 * @param {GweiBalance} feeBigValue
 * @param store
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
    let pubKeyTx = window.localStorage.getItem(`pubKeySignature-${store.account.address}`);
    if (!pubKeyTx) {
      store.openModal("SignPubkey");
      throw new Error("No signed changePubKey was found for the current account");
    }
    try {
      pubKeyTx = JSON.parse(pubKeyTx);
    } catch (error) {
      store.openModal("SignPubkey");
      window.localStorage.removeItem(`pubKeySignature-${store.account.address}`);
      throw new Error("Couldn't parse saved signed changePubKey");
    }
    // @ts-ignore
    pubKeyTx = {
      // @ts-ignore
      ...pubKeyTx,
      fee: accountActivationFee,
      feeToken: syncWallet!.provider.tokenSet.resolveTokenId(feeToken),
      feeTokenId: syncWallet!.provider.tokenSet.resolveTokenId(feeToken),
    };
    // @ts-ignore
    const changePubKeyTx = await syncWallet!.signer!.signSyncChangePubKey(pubKeyTx);
    batchBuilder.addChangePubKey({
      tx: changePubKeyTx,
      // @ts-ignore
      alreadySigned: true,
    });
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
  const batchTransactionData = await batchBuilder.build();
  for (const tx of batchTransactionData.txs) {
    if (tx.tx.type === "ChangePubKey") {
      tx.ethereumSignature = {
        type: "EthereumSignature",
        signature: tx.tx.ethSignature!,
      };
      break;
    }
  }
  const transactions = await submitSignedTransactionsBatch(syncWallet!.provider, batchTransactionData.txs, [batchTransactionData.signature]);
  for (const tx of transactions) {
    store.transaction.watchTransaction({ transactionHash: tx.txHash });
  }
  return transactions;
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
 * @param store
 * @return {Promise<{txData: *, txHash: *}[]>}
 */
export const withdraw = async ({ address, token, feeToken, amount, fastWithdraw, fee, accountActivationFee, store }: WithdrawParams) => {
  const syncWallet = walletData.get().syncWallet;
  const nonce = await syncWallet!.getNonce("committed");
  const batchBuilder = syncWallet!.batchBuilder(nonce);

  if (store.wallet.isAccountLocked) {
    let pubKeyTx = window.localStorage.getItem(`pubKeySignature-${store.account.address}`);
    if (!pubKeyTx) {
      store.openModal("SignPubkey");
      throw new Error("No signed changePubKey was found for the current account");
    }
    try {
      pubKeyTx = JSON.parse(pubKeyTx);
    } catch (error) {
      store.openModal("SignPubkey");
      window.localStorage.removeItem(`pubKeySignature-${store.account.address}`);
      throw new Error("Couldn't parse saved signed changePubKey");
    }
    // @ts-ignore
    pubKeyTx = {
      // @ts-ignore
      ...pubKeyTx,
      fee: accountActivationFee,
      feeToken: syncWallet!.provider.tokenSet.resolveTokenId(feeToken),
      feeTokenId: syncWallet!.provider.tokenSet.resolveTokenId(feeToken),
    };
    // @ts-ignore
    const changePubKeyTx = await syncWallet!.signer!.signSyncChangePubKey(pubKeyTx);
    console.log("signed changePubKeyTx", changePubKeyTx);
    batchBuilder.addChangePubKey({
      tx: changePubKeyTx,
      // @ts-ignore
      alreadySigned: true,
    });
  }
  if (token === feeToken) {
    batchBuilder.addWithdraw({
      ethAddress: address,
      fastProcessing: !!fastWithdraw,
      token,
      amount,
      fee,
    });
  } else {
    batchBuilder.addWithdraw({
      fee: "0",
      amount,
      ethAddress: address,
      fastProcessing: !!fastWithdraw,
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
  console.log("batchTransactionData", batchTransactionData);
  for (const tx of batchTransactionData.txs) {
    if (tx.tx.type === "ChangePubKey") {
      tx.ethereumSignature = {
        type: "EthereumSignature",
        signature: tx.tx.ethSignature!,
      };
      break;
    }
  }
  const transactions = await submitSignedTransactionsBatch(syncWallet!.provider, batchTransactionData.txs, [batchTransactionData.signature]);
  for (const tx of transactions) {
    store.transaction.watchTransaction({ transactionHash: tx.txHash });
  }
  return transactions;
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
