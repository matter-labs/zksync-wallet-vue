import { useCallback, useState } from 'react';
import { ContractTransaction, ethers } from 'ethers';
import { useRootData } from 'hooks/useRootData';

import { IEthBalance } from 'types/Common';
import { PriorityOperationReceipt } from 'zksync/build/types';

import { ADDRESS_VALIDATION } from 'constants/regExs';
import { DEFAULT_ERROR } from 'constants/errors';
import { ZK_FEE_MULTIPLIER } from 'constants/magicNumbers';
import { useCancelable } from 'hooks/useCancelable';

const TOKEN = 'ETH';

export const useTransaction = () => {
  const {
    ethBalances,
    hintModal,
    setError,
    setHintModal,
    setVerifyToken,
    setZkBalances,
    tokens,
    walletAddress,
    zkBalances,
    zkWallet,
  } = useRootData(
    ({
      ethBalances,
      hintModal,
      setError,
      setHintModal,
      setVerifyToken,
      setZkBalances,
      tokens,
      walletAddress,
      zkBalances,
      zkWallet,
    }) => ({
      ethBalances: ethBalances.get(),
      hintModal: hintModal.get(),
      setError,
      setHintModal,
      setVerifyToken,
      setZkBalances,
      tokens: tokens.get(),
      walletAddress: walletAddress.get(),
      zkBalances: zkBalances.get(),
      zkWallet: zkWallet.get(),
    }),
  );

  const cancelable = useCancelable();

  const [addressValue, setAddressValue] = useState<string>(
    walletAddress.length === 2 ? walletAddress[1] : '',
  );
  const [amountValue, setAmountValue] = useState<any>(0);
  const [packableAmount, setPackableAmount] = useState<any>();
  const [packableFee, setPackableFee] = useState<any>();
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
          localStorage.getItem(`history${zkWallet?.address()}`) || '[]',
        );
        const newHistory = JSON.stringify([
          { amount, date: new Date(), hash, to, type, token },
          ...history,
        ]);
        localStorage.setItem(`history${zkWallet?.address()}`, newHistory);
      } catch (err) {
        err.name && err.message
          ? setError(`${err.name}: ${err.message}`)
          : setError(DEFAULT_ERROR);
      }
    },
    [setError, zkWallet],
  );

  const transactions = useCallback(
    async (receipt: PriorityOperationReceipt) => {
      try {
        if (receipt && zkWallet) {
          const zkBalance = (await zkWallet.getAccountState()).committed
            .balances;
          const zkBalancePromises = Object.keys(zkBalance).map(async key => {
            return {
              address: tokens[key].address,
              balance: +zkBalance[key] / Math.pow(10, 18),
              symbol: tokens[key].symbol,
            };
          });
          Promise.all(zkBalancePromises)
            .then(res => {
              setZkBalances(res as IEthBalance[]);
            })
            .catch(err => {
              err.name && err.message
                ? setError(`${err.name}: ${err.message}`)
                : setError(DEFAULT_ERROR);
            });
          setAmountValue(0);
        }
        if (receipt.executed) {
          setExecuted(true);
          setLoading(false);
        }
      } catch (err) {
        err.name && err.message
          ? setError(`${err.name}: ${err.message}`)
          : setError(DEFAULT_ERROR);
      }
    },
    [
      setAmountValue,
      setError,
      setExecuted,
      setLoading,
      setZkBalances,
      tokens,
      zkWallet,
    ],
  );

  const deposit = useCallback(
    async (token = TOKEN) => {
      if (zkWallet) {
        try {
          setHintModal('Follow the instructions in the pop up');
          setLoading(true);
          const handleMax = ethBalances.filter(
            balance => balance.symbol === token || balance.address === token,
          );
          const estimateGas =
            token === 'ETH'
              ? +ethers.utils.parseEther('0.0002')
              : +ethers.utils.parseEther('0.00025');
          const executeDeposit = async gas => {
            try {
              const depositPriorityOperation = await cancelable(
                zkWallet.depositToSyncFromEthereum({
                  depositTo: zkWallet.address(),
                  token: token,
                  amount: ethers.utils.bigNumberify(
                    (
                      await import('zksync').then(module =>
                        module.closestPackableTransactionAmount(
                          (amountValue ===
                          +ethers.utils.parseEther(
                            handleMax[0]?.balance.toString(),
                          )
                            ? amountValue -
                              +estimateGas -
                              2 * ZK_FEE_MULTIPLIER * +gas
                            : amountValue
                          )?.toString(),
                        ),
                      )
                    ).toString(),
                  ),
                  maxFeeInETHToken: await import('zksync').then(module =>
                    module.closestPackableTransactionFee(
                      (2 * ZK_FEE_MULTIPLIER * +gas).toString(),
                    ),
                  ),
                }),
              );
              const hash = depositPriorityOperation.ethTx;
              history(
                +(amountValue / Math.pow(10, 18)) || 0,
                hash.hash,
                zkWallet.address(),
                'deposit',
                symbol,
              );
              setHintModal(
                `Waiting for transaction to be mined. \n ${+(
                  amountValue / Math.pow(10, 18)
                )}  \n ${hash.hash}`,
              );
              setHash(hash);
              await depositPriorityOperation
                .awaitEthereumTxCommit()
                .then(() => {
                  setHintModal(
                    `Block has been mined! \n ${+(
                      amountValue / Math.pow(10, 18)
                    )}  \n ${hash.hash}`,
                  );
                  setExecuted(true);
                });
              const receipt = await depositPriorityOperation.awaitReceipt();
              transactions(receipt);
              const verifyReceipt = await depositPriorityOperation.awaitVerifyReceipt();
              setVerifyToken(!!verifyReceipt);
            } catch (err) {
              if (err.message.match(/(?:denied)/i)) {
                setHintModal(err.message);
              } else if (err.name && err.message) {
                setError(`${err.name}: ${err.message}`);
              } else {
                setError(DEFAULT_ERROR);
              }
            }
          };
          cancelable(ethers.getDefaultProvider().getGasPrice())
            .then(res => res.toString())
            .then(data => {
              executeDeposit(data);
            });
        } catch (err) {
          err.name && err.message
            ? setError(`${err.name}: ${err.message}`)
            : setError(DEFAULT_ERROR);
        }
      }
    },
    [
      amountValue,
      hintModal,
      history,
      packableAmount,
      packableFee,
      setError,
      setHash,
      setHintModal,
      setLoading,
      setPackableAmount,
      setPackableFee,
      setVerifyToken,
      transactions,
      zkWallet,
    ],
  );

  const transfer = useCallback(
    async (token = TOKEN) => {
      try {
        if (ADDRESS_VALIDATION['eth'].test(addressValue) && zkWallet) {
          setLoading(true);
          setHintModal('Follow the instructions in the pop up');
          const handleMax = zkBalances.filter(
            balance => balance.symbol === token || balance.address === token,
          );
          const fee = await zkWallet?.provider
            .getTransactionFee('Transfer', amountValue.toString(), token)
            .then(res => res.toString());
          const zkSync = await import('zksync');
          const transferTransaction = await zkWallet.syncTransfer({
            to: addressValue,
            token: token,
            amount: ethers.utils.bigNumberify(
              (
                await zkSync.closestPackableTransactionAmount(
                  (amountValue ===
                  +ethers.utils.parseEther(handleMax[0]?.balance.toString())
                    ? amountValue - +fee
                    : amountValue
                  )?.toString(),
                )
              ).toString(),
            ),
            fee: zkSync.closestPackableTransactionFee(fee),
          });
          const hash = transferTransaction.txHash;
          history(
            +(amountValue / Math.pow(10, 18)) || 0,
            hash,
            addressValue,
            'transfer',
            symbol,
          );
          setHash(hash);
          setHintModal(` \n ${+(amountValue / Math.pow(10, 18))}. \n ${hash}`);
          const receipt = await transferTransaction.awaitReceipt();
          transactions(receipt);
          const verifyReceipt = await transferTransaction.awaitVerifyReceipt();
          setVerifyToken(!!verifyReceipt);
        } else {
          setError(
            `Address: "${addressValue}" doesn't match ethereum address format`,
          );
        }
      } catch (err) {
        if (err.message.match(/(?:denied)/i)) {
          setHintModal('User denied action');
        } else if (err.name && err.message) {
          setError(`${err.name}: ${err.message}`);
        } else {
          setError(DEFAULT_ERROR);
        }
        setLoading(false);
      }
    },
    [
      addressValue,
      amountValue,
      history,
      setError,
      setVerifyToken,
      transactions,
      zkWallet,
    ],
  );

  const withdraw = useCallback(
    async (token = TOKEN) => {
      try {
        if (ADDRESS_VALIDATION['eth'].test(addressValue) && zkWallet) {
          setLoading(true);
          setHintModal('Follow the instructions in the pop up');
          const handleMax = zkBalances.filter(
            balance => balance.symbol === token || balance.address === token,
          );
          const fee = await zkWallet?.provider
            .getTransactionFee('Withdraw', amountValue.toString(), token)
            .then(res => res.toString());
          const withdrawTransaction = await zkWallet.withdrawFromSyncToEthereum(
            {
              ethAddress: addressValue,
              token: token,
              amount: ethers.utils.bigNumberify(
                (
                  await import('zksync').then(module =>
                    module.closestPackableTransactionAmount(
                      (amountValue ===
                      +ethers.utils.parseEther(handleMax[0]?.balance.toString())
                        ? amountValue - +fee
                        : amountValue
                      )?.toString(),
                    ),
                  )
                ).toString(),
              ),
              fee: await import('zksync').then(module =>
                module.closestPackableTransactionFee(fee),
              ),
            },
          );
          const hash = withdrawTransaction.txHash;
          history(
            +(amountValue / Math.pow(10, 18)) || 0,
            hash,
            addressValue,
            'withdraw',
            symbol,
          );
          setHash(hash);
          setHintModal(
            `Waiting for the transaction to be mined.. \n ${+(
              amountValue / Math.pow(10, 18)
            )}  \n ${hash}`,
          );
          if (!!withdrawTransaction) {
            setHintModal(
              `Your withdrawal will be processed in short. \n ${+(
                amountValue / Math.pow(10, 18)
              )}  \n ${hash}`,
            );
          }
          const receipt = await withdrawTransaction.awaitReceipt();
          transactions(receipt);
          const verifyReceipt = await withdrawTransaction.awaitVerifyReceipt();
          setVerifyToken(!!verifyReceipt);
        } else {
          setError(
            `Address: "${addressValue}" doesn't match ethereum address format`,
          );
        }
      } catch (err) {
        if (err.message.match(/(?:denied)/i)) {
          setHintModal('User denied action');
        } else if (err.name && err.message) {
          setError(`${err.name}: ${err.message}`);
        } else {
          setError(DEFAULT_ERROR);
        }
        setLoading(false);
      }
    },
    [
      addressValue,
      amountValue,
      history,
      setError,
      setHash,
      setLoading,
      setVerifyToken,
      transactions,
      zkWallet,
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
