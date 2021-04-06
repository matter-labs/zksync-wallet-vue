import { BigNumber } from "ethers";
import { actionTree, getterTree, mutationTree } from "typed-vuex";
import { Address, Balance, Transaction, zkFeeData, zkOperationType, zkTransaction } from "~/plugins/types";

/**
 * Operation state
 * @return {{emails: string[]}}
 */
export const state = (): {
  isMyAddress: Boolean;
  closestPackableAmount: BigNumber | undefined;
  amount: BigNumber | undefined;
  hasBack: Boolean;
  normalFee: zkFeeData;
  fastFee: zkFeeData;
  isFastFeeAllowed: Boolean;
  isValid: Boolean;
  isProcessing: Boolean;
  feeToken: Balance | undefined;
  operationToken: Balance | undefined;
  error: string;
  isDone: Boolean;
  isFeeLoading: Boolean;
  isLoading: Boolean;
  feeAmount: BigNumber | undefined;
  recipient: string;
  modalOpened: "feeToken" | "token" | "contacts" | undefined;
  operationType: "withdraw" | "activate" | "deposit" | "transfer" | "unlock";
  tip: string;
  model: { amount: string; address: string; tokenSearch: string; contactSearch: string };
  operation: zkTransaction | undefined;
  isContact: Boolean;
} => ({
  /**
   * Operation-related
   */
  operationToken: undefined as undefined | Balance,
  feeToken: undefined as undefined | Balance,

  amount: undefined as undefined | BigNumber,
  closestPackableAmount: undefined as undefined | BigNumber,
  feeAmount: undefined as undefined | BigNumber,

  recipient: "" as Address,

  operationType: "" as zkOperationType,

  /**
   * Enums (options)
   */
  normalFee: {
    isFetched: false as Boolean,
    isPackable: false as Boolean,
    onlyEth: false as Boolean,

    token: undefined as undefined | Balance,
    feeToken: undefined as undefined | Balance,
    feeAmount: undefined as undefined | BigNumber,
    recipient: "" as Address,
    operationType: undefined as undefined | zkOperationType,
  },

  fastFee: {
    isFetched: false as Boolean,
    isPackable: false as Boolean,
    onlyEth: false as Boolean,

    token: undefined as undefined | Balance,
    feeToken: undefined as undefined | Balance,
    feeAmount: undefined as undefined | BigNumber,
    recipient: "" as Address,
    operationType: undefined as undefined | zkOperationType,
  },
  isFastFeeAllowed: true as Boolean,

  /**
   * Screen (current / last operation)
   */
  isMyAddress: false as Boolean,
  isContact: false as Boolean,
  isProcessing: false as Boolean,
  isDone: false as Boolean,

  /**
   * States (relevant to screen)
   */
  tip: "" as string,
  error: "" as string,
  isValid: false as Boolean,
  isLoading: false as Boolean,
  isFeeLoading: false as Boolean,
  hasBack: false as Boolean,

  model: {
    address: "" as string,
    amount: "" as string,
    contactSearch: "" as string,
    tokenSearch: "" as string,
  },

  operation: undefined as undefined | zkTransaction,
  modalOpened: undefined as undefined | "feeToken" | "token" | "contacts",
});

export type OperationState = ReturnType<typeof state>;

export const getters = getterTree(state, {
  model: (state) => state.model,
});

export const mutations = mutationTree(state, {
  setRecipient(state, recipient: Address) {
    state.recipient = recipient;
  },
  setOperationToken(state, operationToken: Balance) {
    state.operationToken = operationToken;
  },
  setType(state, operationType: zkOperationType) {
    state.operationType = operationType;
  },
});

export const actions = actionTree(
  { state, getters, mutations },
  {
    async resetEmail({ commit, dispatch, getters, state }) {
      mutations.setOperationToken(state, token);
      mutations.setType(state, type);
      mutations.setRecipient(state, recipient);
    },

    prepareOperation({}) {
      commit("");
    },
    transaction({ dispatch }, { address: Address, token: TokenSymbol, feeToken: TokenSymbol, amountBigValue: GweiBalance, feeBigValue: GweiBalance }) {
      const syncWallet = walletData.get().syncWallet;
      let nonce = await syncWallet!.getNonce("committed");
      const transferTx = {
        fee: 0,
        nonce,
        amount: amountBigValue,
        to: address,
        token,
      };
      nonce += 1;
      const feeTx = {
        fee: feeBigValue,
        nonce,
        amount: 0,
        to: syncWallet!.address(),
        token: feeToken,
      };

      /**
       * @todo: process case when there are 2 transactions
       */
      if (token === feeToken) {
        const transaction = (await syncWallet!.syncTransfer({
          to: address,
          token,
          amount: amountBigValue,
          fee: feeBigValue,
        })) as Transaction;
        await dispatch("watchTransaction", { transactionHash: transaction.txHash, tokenSymbol: token, type: "withdraw" });
        return transaction;
      }
      const transferTransaction = await syncWallet!.syncMultiTransfer([transferTx, feeTx]);
      for (let a = 0; a < transferTransaction.length; a++) {
        await dispatch("watchTransaction", { transactionHash: transferTransaction[a].txHash, tokenSymbol: a === 0 ? token : feeToken, type: "withdraw" });
      }
      return transferTransaction;
    },
    withdraw({ state }, { address: Address, token: Symbol, feeToken: Symbol, amount: GweiBalance, fastWithdraw: GweiBalance, fees }) {
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
        store.transaction.watchTransaction({ transactionHash: transaction.txHash, tokenSymbol: token, type: "transfer" });
        return transaction;
      } else {
        const withdrawals = [
          {
            ethAddress: address,
            amount: amountBigValue,
            fee: "0",
            token,
          },
        ];
        const transfers = [
          {
            to: syncWallet!.address(),
            token: feeToken,
            amount: "0",
            fee: feeBigValue,
          },
        ];
        if (!syncWallet!.signer) {
          throw new Error("zkSync signer is required for sending zksync transactions.");
        } else if (transfers.length === 0) {
          throw new Error("No transfers in queue");
        }

        const signedTransactions = [] as Array<Tx>;
        let signWithdrawTransaction = null;

        let nextNonce = await syncWallet!.getNonce();

        for (const item of withdrawals) {
          const nonce = nextNonce;
          nextNonce += 1;

          signWithdrawTransaction = await syncWallet!
            .signWithdrawFromSyncToEthereum({
              ...item,
              nonce,
            })
            .catch((error) => {
              throw new Error("Error while performing signWithdrawFromSyncToEthereum: " + error.message);
            });

          // @ts-ignore: Unreachable code error
          signedTransactions.push({ tx: signWithdrawTransaction.tx, signature: signWithdrawTransaction.ethereumSignature });
        }

        for (const item of transfers) {
          const nonce = nextNonce;
          nextNonce += 1;

          const signTransaction = await syncWallet!
            .signSyncTransfer({
              ...item,
              nonce,
            })
            .catch((error) => {
              throw new Error("Error while performing signSyncTransfer: " + error.message);
            });

          // @ts-ignore: Unreachable code error
          signedTransactions.push({ tx: signTransaction.tx, signature: signTransaction.ethereumSignature });
        }

        const transactionHashes = await syncWallet!.provider.submitTxsBatch(signedTransactions).catch((error) => {
          throw new Error("Error while performing submitTxsBatch: " + error.message);
        });
        for (let a = 0; a < transactionHashes.length; a++) {
          store.transaction.watchTransaction({ transactionHash: transactionHashes[a], tokenSymbol: a === 0 ? token : feeToken, type: "transfer" });
        }
        return transactionHashes.map((txHash, index) => ({
          txData: signedTransactions[index],
          txHash,
        }));
      }
    },
    deposit({ dispatch }, { token: TokenSymbol, amount: GweiBalance, store: any }) {
      const wallet = walletData.get().syncWallet;
      const depositResponse = await wallet?.depositToSyncFromEthereum({
        depositTo: wallet.address(),
        token,
        amount,
      });
      dispatch("watchDeposit", { depositTx: depositResponse, tokenSymbol: token, amount });
      return depositResponse;
    },
  },
);
