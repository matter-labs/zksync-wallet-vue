import { useState, useCallback } from 'react';
import { ContractTransaction, ethers } from 'ethers';
import { depositFromETH } from 'zksync';

import { useRootData } from '../hooks/useRootData';

import { IEthBalance } from '../types/Common';
import { PriorityOperationReceipt } from 'zksync/build/types';

import { DEFAULT_ERROR } from '../constants/errors';

const TOKEN = 'ETH';

export const useTransaction = () => {
  const [addressValue, setAddressValue] = useState<string>('');
  const [amountValue, setAmountValue] = useState<number | undefined>(0);
  const [hash, setHash] = useState<ContractTransaction | string | undefined>();
  const [isExecuted, setExecuted] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);

  const { ethWallet, setError, setZkBalances, tokens, zkWallet } = useRootData(
    ({ ethWallet, setError, setZkBalances, tokens, zkWallet }) => ({
      ethWallet: ethWallet.get(),
      setError,
      setZkBalances,
      tokens: tokens.get(),
      zkWallet: zkWallet.get(),
    }),
  );

  const history = useCallback(
    (amount: number, hash: string | undefined, to: string, type: string) => {
      try {
        const history = JSON.parse(localStorage.getItem('history') || '[]');
        const newHistory = JSON.stringify([{ amount, date: new Date(), hash, to, type }, ...history]);
        localStorage.setItem('history', newHistory);
      } catch (err) {
        err.name && err.message ? setError(`${err.name}:${err.message}`) : setError(DEFAULT_ERROR);
      }
    },
    [setError],
  );

  const transactions = useCallback(
    async (receipt: PriorityOperationReceipt) => {
      try {
        if (receipt) {
          setLoading(false);
          const zkBalance = (await zkWallet.getAccountState()).committed.balances;
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
              err.name && err.message ? setError(`${err.name}:${err.message}`) : setError(DEFAULT_ERROR);
            });
          setAmountValue(0);
        }
        if (receipt.executed) {
          setExecuted(true);
        }
      } catch (err) {
        err.name && err.message ? setError(`${err.name}:${err.message}`) : setError(DEFAULT_ERROR);
      }
    },
    [setAmountValue, setError, setExecuted, setLoading, setZkBalances, tokens, zkWallet],
  );

  const deposit = useCallback(
    async (token = TOKEN) => {
      try {
        setLoading(true);
        const depositPriorityOperation = await depositFromETH({
          depositFrom: ethWallet,
          depositTo: zkWallet,
          token: token,
          amount: ethers.utils.parseEther(amountValue ? amountValue?.toString() : '0'),
        });
        const hash = depositPriorityOperation.ethTx;
        history(amountValue || 0, hash.hash, zkWallet.address(), 'deposit');
        setHash(hash);
        const receipt = await depositPriorityOperation.awaitReceipt();
        transactions(receipt);
      } catch (err) {
        err.name && err.message ? setError(`${err.name}:${err.message}`) : setError(DEFAULT_ERROR);
      }
    },
    [amountValue, ethWallet, history, setError, setHash, setLoading, transactions, zkWallet],
  );

  const transfer = useCallback(
    async (token = TOKEN) => {
      setLoading(true);
      const transferTransaction = await zkWallet.syncTransfer({
        to: addressValue,
        token: token,
        amount: ethers.utils.parseEther(amountValue ? amountValue.toString() : '0'),
        fee: ethers.utils.parseEther('0.001'),
      });
      const hash = transferTransaction.txHash;
      history(amountValue || 0, hash, addressValue, 'transfer');
      setHash(hash);
      const receipt = await transferTransaction.awaitReceipt();
      transactions(receipt);
    },
    [addressValue, amountValue, history, transactions, zkWallet],
  );

  const withdraw = useCallback(
    async (token = TOKEN) => {
      setLoading(true);
      const withdrawTransaction = await zkWallet.withdrawTo({
        ethAddress: addressValue,
        token: token,
        amount: ethers.utils.parseEther(amountValue ? amountValue?.toString() : '0'),
        fee: ethers.utils.parseEther('0.001'),
      });
      const hash = withdrawTransaction.txHash;
      history(amountValue || 0, hash, addressValue, 'withdraw');
      setHash(hash);
      const receipt = await withdrawTransaction.awaitReceipt();
      transactions(receipt);
    },
    [addressValue, amountValue, history, setHash, setLoading, transactions, zkWallet],
  );

  return {
    addressValue,
    amountValue,
    deposit,
    hash,
    isExecuted,
    isLoading,
    setAddressValue,
    setAmountValue,
    setExecuted,
    setHash,
    transfer,
    withdraw,
  };
};
