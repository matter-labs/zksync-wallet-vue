import { useCallback, useState } from 'react';
import { ContractTransaction, ethers, utils } from 'ethers';
import { PriorityOperationReceipt } from 'zksync/build/types';
import JSBI from 'jsbi';

import { IEthBalance } from 'types/Common';

import { ADDRESS_VALIDATION } from 'constants/regExs';
import { DEFAULT_ERROR } from 'constants/errors';
import { ZK_FEE_MULTIPLIER } from 'constants/magicNumbers';
import { useCancelable } from 'hooks/useCancelable';
import { useStore } from 'src/store/context';
import { LINKS_CONFIG } from 'src/config';

import { handleFormatToken } from 'src/utils';

const TOKEN = 'ETH';

export const useTransaction = () => {
  const store = useStore();

  const { ethBalances, tokens, walletAddress, zkBalances, zkWallet } = store;

  const cancelable = useCancelable();

  const [addressValue, setAddressValue] = useState<string>(
    walletAddress.address ? walletAddress.address : '',
  );
  const [amountValue, setAmountValue] = useState<any>(0);
  const [hash, setHash] = useState<ContractTransaction | string | undefined>();
  const [isExecuted, setExecuted] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [symbol, setSymbol] = useState<string>('');

  const [maxValueProp, setMaxValueProp] = useState<number>(0);
  const [symbolNameProp, setSymbolNameProp] = useState<string>('');
  const [tokenProp, setTokenProp] = useState<string>('');

  const history = useCallback(
    (
      amount: number,
      hash: string | undefined,
      to: string,
      type: string,
      token: string,
    ) => {
      try {
        const history = JSON.parse(
          window.localStorage?.getItem(`history${zkWallet?.address()}`) || '[]',
        );
        const newHistory = JSON.stringify([
          { amount, date: new Date(), hash, to, type, token },
          ...history,
        ]);
        window.localStorage?.setItem(
          `history${zkWallet?.address()}`,
          newHistory,
        );
      } catch (err) {
        err.name && err.message
          ? (store.error = `${err.name}: ${err.message}`)
          : (store.error = DEFAULT_ERROR);
      }
    },
    [store.error, zkWallet],
  );

  const transactions = useCallback(
    async (receipt: PriorityOperationReceipt) => {
      try {
        if (receipt && zkWallet && tokens) {
          const _accountState = await zkWallet.getAccountState();
          const zkBalance = _accountState.committed.balances;
          store.awaitedTokens = _accountState.depositing;
          const zkBalancePromises = Object.keys(zkBalance).map(async key => {
            return {
              address: tokens[key].address,
              balance: +handleFormatToken(
                zkWallet,
                tokens[key].symbol,
                +zkBalance[key] ? +zkBalance[key] : 0,
              ),
              symbol: tokens[key].symbol,
            };
          });
          Promise.all(zkBalancePromises)
            .then(res => {
              store.zkBalances = res as IEthBalance[];
              store.zkBalancesLoaded = true;
            })
            .catch(err => {
              err.name && err.message
                ? (store.error = `${err.name}: ${err.message}`)
                : (store.error = DEFAULT_ERROR);
            });
          setAmountValue(0);
        }

        if (receipt.executed) {
          setExecuted(true);
          setLoading(false);
        }
      } catch (err) {
        err.name && err.message
          ? (store.error = `${err.name}: ${err.message}`)
          : (store.error = DEFAULT_ERROR);
      }
    },
    [
      setAmountValue,
      setLoading,
      tokens,
      zkWallet,
      store.error,
      store.zkBalances,
    ],
  );

  const deposit = useCallback(
    async (token = TOKEN) => {
      if (zkWallet) {
        const zkSync = await import('zksync');
        try {
          if (!store.isBurnerWallet)
            store.hint = 'Follow the instructions in the pop up';
          setLoading(true);
          const handleMax = ethBalances.filter(
            balance => balance.symbol === token || balance.address === token,
          );
          const estimateGas =
            token === '0x0000000000000000000000000000000000000000' &&
            store.zkWallet
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
                !!store.EIP1271Signature //TODO: check what need to pass
                  ? zkWallet.depositToSyncFromEthereum({
                      depositTo: zkWallet.address(),
                      token: token,
                      amount: ethers.BigNumber.from(
                        (
                          await zkSync.closestPackableTransactionAmount(
                            JSBI.BigInt(
                              token ===
                                '0x0000000000000000000000000000000000000000' &&
                                estimateGas &&
                                maxBigValue &&
                                amountValue === +maxBigValue
                                ? amountValue - +estimateGas
                                : amountValue,
                            )?.toString(),
                          )
                        ).toString(),
                      ),
                      approveDepositAmountForERC20: true,
                    })
                  : zkWallet.depositToSyncFromEthereum({
                      depositTo: zkWallet.address(),
                      token: token,
                      amount: ethers.BigNumber.from(
                        (
                          await zkSync.closestPackableTransactionAmount(
                            JSBI.BigInt(
                              token ===
                                '0x0000000000000000000000000000000000000000' &&
                                estimateGas &&
                                maxBigValue &&
                                amountValue === +maxBigValue
                                ? amountValue - +estimateGas
                                : amountValue,
                            )?.toString(),
                          )
                        ).toString(),
                      ),
                    }),
              );
              const hash = depositPriorityOperation.ethTx;
              store.hint = `Waiting for transaction to be mined. \n ${+handleFormatToken(
                zkWallet,
                token,
                +amountValue,
              )}  \n${hash.hash}`;
              setHash(hash);
              await depositPriorityOperation
                .awaitEthereumTxCommit()
                .then(res => {
                  store.hint = `Your deposit tx has been mined and will be processed after ${
                    store.maxConfirmAmount
                  } confirmations. Use the link below to track the progress. \n ${+handleFormatToken(
                    zkWallet,
                    token,
                    +amountValue,
                  )}  \n${hash.hash}`;
                  setExecuted(true);
                });
              const _accountState = await zkWallet.getAccountState();
              store.awaitedTokens = _accountState.depositing.balances;
              if (Object.keys(store.awaitedTokens).length > 0) {
                for (const token in store.awaitedTokens) {
                  const _list = Object.entries(store.zkBalances).map(
                    el => el[1].symbol,
                  );
                  if (_list.indexOf(token) === -1) {
                    store.zkBalancesLoaded = true;
                    store.zkBalances = store.zkBalances.concat([
                      {
                        symbol: token,
                        balance: 0,
                        address: 'awaited',
                      },
                    ]);
                  }
                }
              }
            } catch (err) {
              setLoading(false);
              if (err.message.match(/(?:denied)/i)) {
                store.hint = err.message;
              } else if (err.name && err.message) {
                store.error = `${err.name}: ${err.message}`;
              } else {
                store.error = DEFAULT_ERROR;
              }
            }
          };
          cancelable(
            ethers.getDefaultProvider(LINKS_CONFIG.network).getGasPrice(),
          )
            .then(res => res)
            .then(data => {
              executeDeposit(data);
            });
        } catch (err) {
          setLoading(false);
          err.name && err.message
            ? (store.error = `${err.name}: ${err.message}`)
            : (store.error = DEFAULT_ERROR);
        }
      }
    },
    [
      symbol,
      amountValue,
      store.hint,
      history,
      setHash,
      setLoading,
      transactions,
      zkWallet,
      store.error,
      store.verifyToken,
      store.awaitedTokens,
      store.zkBalances,
      store.maxConfirmAmount,
      cancelable,
      ethBalances,
    ],
  );

  const transfer = useCallback(
    async (address?, type?, symbol = TOKEN) => {
      try {
        const fee = await zkWallet?.provider
          .getTransactionFee('Transfer', addressValue, symbol)
          .then(res => res.totalFee);
        store.txButtonUnlocked = false;
        if (ADDRESS_VALIDATION['eth'].test(addressValue) && zkWallet && fee) {
          setLoading(true);
          if (!store.isBurnerWallet)
            store.hint = 'Follow the instructions in the pop up';
          const handleMax = zkBalances.filter(
            balance => balance.symbol === symbol || balance.address === symbol,
          );
          const maxBigValue = store.zkWallet?.provider.tokenSet.parseToken(
            symbol,
            handleMax[0]?.balance.toString(),
          );
          const zkSync = await import('zksync');
          const transferTransaction = await zkWallet.syncTransfer({
            to: addressValue,
            token: symbol,
            amount: ethers.BigNumber.from(
              (
                await zkSync.closestPackableTransactionAmount(
                  JSBI.BigInt(
                    maxBigValue && amountValue === +maxBigValue
                      ? amountValue - +fee
                      : amountValue,
                  )?.toString(),
                )
              ).toString(),
            ),
            fee: zkSync.closestPackableTransactionFee(fee),
          });
          const hash = transferTransaction.txHash;
          setHash(hash);
          store.hint = ` \n ${+handleFormatToken(
            zkWallet,
            symbol,
            +amountValue,
          )}. \n${hash}`;
          const receipt = await transferTransaction.awaitReceipt();
          transactions(receipt);
          if (!!receipt) store.txButtonUnlocked = true;
          const verifyReceipt = await transferTransaction.awaitVerifyReceipt();
          store.verifyToken = !!verifyReceipt;
        } else {
          store.error = `Address: "${addressValue}" doesn't match ethereum address format`;
        }
      } catch (err) {
        store.txButtonUnlocked = true;
        if (err.message.match(/(?:denied)/i)) {
          store.hint = err.message;
        } else if (err.name && err.message) {
          store.error = `${err.name}: ${err.message}`;
        } else {
          store.error = DEFAULT_ERROR;
        }
        setLoading(false);
      }
    },
    [
      addressValue,
      amountValue,
      history,
      store.verifyToken,
      store.error,
      store.hint,
      transactions,
      zkWallet,
    ],
  );

  const withdraw = useCallback(
    async (address?, type?, symbol = TOKEN) => {
      try {
        const zkSync = await import('zksync');
        const fee = await zkWallet?.provider
          .getTransactionFee('Withdraw', addressValue, symbol)
          .then(res => res.totalFee);
        const fastFee = await zkWallet?.provider
          .getTransactionFee('FastWithdraw', addressValue, symbol)
          .then(res => res.totalFee);
        store.txButtonUnlocked = false;
        if (
          ADDRESS_VALIDATION['eth'].test(addressValue) &&
          zkWallet &&
          fee &&
          fastFee
        ) {
          setLoading(true);
          if (!store.isBurnerWallet)
            store.hint = 'Follow the instructions in the pop up';
          const handleMax = zkBalances.filter(
            balance => balance.symbol === symbol || balance.address === symbol,
          );
          const maxBigValue = store.zkWallet?.provider.tokenSet.parseToken(
            symbol,
            handleMax[0]?.balance.toString(),
          );
          ethers.BigNumber;
          const withdrawTransaction = await zkWallet.withdrawFromSyncToEthereum(
            {
              ethAddress: addressValue,
              token: symbol,
              amount: ethers.BigNumber.from(
                (
                  await zkSync.closestPackableTransactionAmount(
                    JSBI.BigInt(
                      maxBigValue && amountValue === +maxBigValue
                        ? amountValue - +fee
                        : amountValue,
                    )?.toString(),
                  )
                ).toString(),
              ),
              fee: zkSync.closestPackableTransactionFee(
                store.fastWithdrawal ? fastFee : fee,
              ),
              fastProcessing: store.fastWithdrawal,
            },
          );
          const hash = withdrawTransaction.txHash;
          setHash(hash);
          store.hint = `Waiting for the transaction to be mined.. \n ${+handleFormatToken(
            zkWallet,
            symbol,
            +amountValue,
          )} \n${hash}`;
          if (!!withdrawTransaction) {
            store.hint = `Your withdrawal will be processed shortly. \n ${+handleFormatToken(
              zkWallet,
              symbol,
              +amountValue,
            )} \n${hash}`;
          }
          const receipt = await withdrawTransaction.awaitReceipt();
          transactions(receipt);
          if (!!receipt) store.txButtonUnlocked = true;
          const verifyReceipt = await withdrawTransaction.awaitVerifyReceipt();
          store.verifyToken = !!verifyReceipt;
        } else {
          store.error = `Address: "${addressValue}" doesn't match ethereum address format`;
        }
      } catch (err) {
        store.txButtonUnlocked = true;
        if (err.message.match(/(?:denied)/i)) {
          store.hint = err.message;
        } else if (err.name && err.message) {
          store.error = `${err.name}: ${err.message}`;
        } else {
          store.error = DEFAULT_ERROR;
        }
        setLoading(false);
      }
    },
    [
      addressValue,
      amountValue,
      history,
      store.error,
      setHash,
      setLoading,
      store.verifyToken,
      transactions,
      zkWallet,
      store.hint,
      store.fastWithdrawal,
    ],
  );

  return {
    addressValue,
    amountValue,
    deposit,
    hash,
    isExecuted,
    isLoading,
    maxValueProp,
    setAddressValue,
    setAmountValue,
    setExecuted,
    setHash,
    setLoading,
    setMaxValueProp,
    setSymbol,
    setSymbolNameProp,
    setTokenProp,
    symbolNameProp,
    tokenProp,
    transfer,
    withdraw,
  };
};
