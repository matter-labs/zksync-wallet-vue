import { useState, useCallback } from 'react';
import { ContractTransaction, ethers } from 'ethers';

import { useRootData } from '../hooks/useRootData';

import { IEthBalance } from '../types/Common';
import { PriorityOperationReceipt } from 'zksync/build/types';

import { ADDRESS_VALIDATION } from '../constants/regExs';
import { DEFAULT_ERROR } from '../constants/errors';

const TOKEN = 'ETH';

export const useTransaction = () => {
  const [addressValue, setAddressValue] = useState<string>('');
  const [amountValue, setAmountValue] = useState<any>(0);
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
    (amount: number, hash: string | undefined, to: string, type: string, token: string) => {
      try {
        const history = JSON.parse(localStorage.getItem('history') || '[]');
        const newHistory = JSON.stringify([{ amount, date: new Date(), hash, to, type, token }, ...history]);
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
        if (receipt && zkWallet) {
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
      if (zkWallet) {
        try {
          setLoading(true);
          const depositPriorityOperation = await zkWallet.depositToSyncFromEthereum({
            depositTo: zkWallet.address(),
            token: token,
            amount: ethers.utils.bigNumberify(amountValue ? amountValue?.toString() : '0'),
          });
          const hash = depositPriorityOperation.ethTx;
          history(amountValue / Math.pow(10, 18) || 0, hash.hash, zkWallet.address(), 'deposit', token);
          setHash(hash);
          const receipt = await depositPriorityOperation.awaitReceipt();
          transactions(receipt);
        } catch (err) {
          err.name && err.message ? setError(`${err.name}:${err.message}`) : setError(DEFAULT_ERROR);
        }
      }
    },
    [amountValue, ethWallet, history, setError, setHash, setLoading, transactions, zkWallet],
  );

  const transfer = useCallback(
    async (token = TOKEN, type) => {
      try {
        console.log(addressValue);
        // console.log({
        //   to: addressValue,
        //   token: token,
        //   amount: ethers.utils.parseEther(amountValue ? amountValue.toString() : '0'),
        //   fee: ethers.utils.parseEther('0.001'),
        // });
        if (ADDRESS_VALIDATION[type].test(addressValue) && zkWallet) {
          setLoading(true);
          const transferTransaction = await zkWallet.syncTransfer({
            to: addressValue,
            token: token,
            amount: ethers.utils.bigNumberify(amountValue ? amountValue?.toString() : '0'),
            fee: ethers.utils.parseEther('0.001'),
          });
          const hash = transferTransaction.txHash;
          history(amountValue / Math.pow(10, 18) || 0, hash, addressValue, 'transfer', token);
          setHash(hash);
          const receipt = await transferTransaction.awaitReceipt();
          transactions(receipt);
        } else {
          setError(`Address: "${addressValue}" doesn't match following format "sync:...." `);
        }
      } catch (err) {
        err.name && err.message ? setError(`${err.name}:${err.message}`) : setError(DEFAULT_ERROR);
        setLoading(false);
      }
    },
    [addressValue, amountValue, history, setError, transactions, zkWallet],
  );

  const withdraw = useCallback(
    async (token = TOKEN, type) => {
      try {
        if (ADDRESS_VALIDATION[type].test(addressValue) && zkWallet) {
          setLoading(true);
          const withdrawTransaction = await zkWallet.withdrawFromSyncToEthereum({
            ethAddress: addressValue,
            token: token,
            amount: ethers.utils.bigNumberify(amountValue ? amountValue?.toString() : '0'),
            fee: ethers.utils.parseEther('0.001'),
          });
          const hash = withdrawTransaction.txHash;
          history(amountValue / Math.pow(10, 18) || 0, hash, addressValue, 'withdraw', token);
          setHash(hash);
          const receipt = await withdrawTransaction.awaitReceipt();
          transactions(receipt);
        } else {
          setError(`Address: "${addressValue}" doesn't match ethereum address format`);
        }
      } catch (err) {
        err.name && err.message ? setError(`${err.name}:${err.message}`) : setError(DEFAULT_ERROR);
        setLoading(false);
      }
    },
    [addressValue, amountValue, history, setError, setHash, setLoading, transactions, zkWallet],
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
