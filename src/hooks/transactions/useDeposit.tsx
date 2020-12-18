import { useCallback} from 'react';
import { ethers} from 'ethers';

import { DEFAULT_ERROR } from 'constants/errors';
import { useCancelable } from 'hooks/useCancelable';
import { useStore } from 'src/store/context';
import { errorProcessing } from 'hooks/transactions/Base';
import {
  handleFormatToken,
  sortBalancesById,
} from 'src/utils';

const TOKEN = 'ETH';

export const useDeposit = () => {
  const store = useStore();

  const { TokensStore } = store;

  const { zkWallet, TransactionStore } = store;


  const cancelable = useCancelable();

  const deposit = useCallback(
          async (token = TOKEN) => {
            if (zkWallet) {
              const zkSync = await import('zksync');
              try {
                if (!store.isBurnerWallet) store.hint = 'Follow the instructions in the pop up';
                TransactionStore.isLoading = true;
                const handleMax = TokensStore.ethBalances.filter(
                        balance => balance.symbol === token || balance.address === token,
                );
                const estimateGas =
                        token === '0x0000000000000000000000000000000000000000' && store.zkWallet
                                ? +store.zkWallet?.provider.tokenSet.parseToken('ETH', '0.0002')
                                : store.zkWallet &&
                                +store.zkWallet?.provider.tokenSet.parseToken('ETH', '0.00025');
                const maxBigValue = store.zkWallet?.provider.tokenSet.parseToken(
                        token,
                        handleMax[0]?.balance.toString(),
                );
                const executeDeposit = async gas => {
                  try {
                    const depositPriorityOperation = await cancelable(
                            store.EIP1271Signature // TODO: check what need to pass
                                    ? zkWallet.depositToSyncFromEthereum({
                                      depositTo: zkWallet.address(),
                                      token: token,
                                      amount: ethers.BigNumber.from(
                                              zkSync
                                                      .closestPackableTransactionAmount(
                                                              TransactionStore.amountBigValue,
                                                      )
                                                      .toString(),
                                      ),
                                      approveDepositAmountForERC20: true,
                                    })
                                    : zkWallet.depositToSyncFromEthereum({
                                      depositTo: zkWallet.address(),
                                      token: token,
                                      amount: ethers.BigNumber.from(
                                              zkSync
                                                      .closestPackableTransactionAmount(
                                                              TransactionStore.amountBigValue,
                                                      )
                                                      .toString(),
                                      ),
                                    }),
                    );
                    const hash = depositPriorityOperation.ethTx;
                    store.hint = `Waiting for transaction to be mined. \n ${+handleFormatToken(zkWallet, token, TransactionStore.amountBigValue)}  \n${hash.hash}`;
                    TransactionStore.transactionHash = hash;
                    await depositPriorityOperation.awaitEthereumTxCommit().then(res => {
                      store.hint = `Your deposit tx has been mined and will be processed after ${
                              store.maxConfirmAmount
                      } confirmations. Use the link below to track the progress. \n ${+handleFormatToken(zkWallet, token, TransactionStore.amountBigValue)}  \n${hash.hash}`;
                      TransactionStore.isTransactionExecuted = true;
                    });
                    const _accountState = await zkWallet.getAccountState();
                    TokensStore.awaitedTokens = _accountState.depositing.balances;
                    if (Object.keys(TokensStore.awaitedTokens).length > 0) {
                      for (const token in TokensStore.awaitedTokens) {
                        const _list = Object.entries(TokensStore.zkBalances).map(
                                el => el[1].symbol,
                        );
                        if (_list.indexOf(token) === -1) {
                          TokensStore.zkBalancesLoaded = true;
                          TokensStore.zkBalances = TokensStore.zkBalances
                                  .concat([
                                    {
                                      symbol: token,
                                      balance: 0,
                                      address: 'awaited',
                                      id: 999,
                                    },
                                  ])
                                  .sort(sortBalancesById);
                        }
                      }
                    }
                  } catch (err) {
                    errorProcessing(store, err);
                  }
                };
                const gasPrice =await TokensStore.getGasPrice();
                cancelable(executeDeposit(gasPrice))
              } catch (err) {
                TransactionStore.isLoading = false;
                err.name && err.message ? (store.error = `${err.name}: ${err.message}`) : (store.error = DEFAULT_ERROR);
              }
            }
          },
          [
            TransactionStore.amountBigValue,
            TransactionStore.amountValue,
            TransactionStore.symbolName,
            TransactionStore.transactionHash,
            store.hint,
            TransactionStore.isLoading,
            zkWallet,
            store.error,
            store.verifyToken,
            TokensStore.awaitedTokens,
            TokensStore.zkBalances,
            store.maxConfirmAmount,
            cancelable,
            TokensStore.ethBalances,
            TokensStore.zkBalancesLoaded,
            TransactionStore.isTransactionExecuted,
            store.EIP1271Signature,
            store.isBurnerWallet,
            store.zkWallet,
          ],
  );


  return {
    deposit
  };
};
