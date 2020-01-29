import { useState, useCallback } from 'react';
import { ContractTransaction, ethers } from 'ethers';
import { depositFromETH } from 'zksync';

import { useRootData } from '../hooks/useRootData';

import { PriorityOperationReceipt } from 'zksync/build/types';

const TOKEN = 'ETH';

export const useTransaction = () => {
  const [addressValue, setAddressValue] = useState<string>('');
  const [amountValue, setAmountValue] = useState<number | undefined>(0);
  const [hash, setHash] = useState<ContractTransaction | string | undefined>();
  const [isExecuted, setExecuted] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);

  const { ethWallet, setZkBalance, zkWallet } = useRootData(({ ethWallet, setZkBalance, zkWallet }) => ({
    ethWallet: ethWallet.get(),
    setZkBalance,
    zkWallet: zkWallet.get(),
  }));

  const history = useCallback((amount: number, hash: string | undefined, to: string, type: string) => {
    try {
      const history = JSON.parse(localStorage.getItem('history') || '[]');
      const newHistory = JSON.stringify([{ amount, date: new Date(), hash, to, type }, ...history]);
      localStorage.setItem('history', newHistory);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const transactions = useCallback(
    async (receipt: PriorityOperationReceipt) => {
      try {
        if (receipt) {
          setLoading(false);
          const zkBalance = (await zkWallet.getAccountState()).committed.balances;
          setZkBalance(zkBalance);
          setAmountValue(0);
        }
        if (receipt.executed) {
          setExecuted(true);
        }
      } catch (err) {
        console.error(err);
      }
    },
    [setAmountValue, setExecuted, setLoading, setZkBalance, zkWallet],
  );

  const deposit = useCallback(async () => {
    try {
      setLoading(true);
      const depositPriorityOperation = await depositFromETH({
        depositFrom: ethWallet,
        depositTo: zkWallet,
        token: TOKEN,
        amount: ethers.utils.parseEther(amountValue ? amountValue?.toString() : '0'),
      });
      const hash = depositPriorityOperation.ethTx;
      history(amountValue || 0, hash.hash, zkWallet.address(), 'deposit');
      setHash(hash);
      const receipt = await depositPriorityOperation.awaitReceipt();
      transactions(receipt);
    } catch (err) {
      console.error(err);
    }
  }, [amountValue, ethWallet, history, setHash, setLoading, transactions, zkWallet]);

  const transfer = useCallback(async () => {
    setLoading(true);
    const transferTransaction = await zkWallet.syncTransfer({
      to: addressValue,
      token: TOKEN,
      amount: ethers.utils.parseEther(amountValue ? amountValue.toString() : '0'),
      fee: ethers.utils.parseEther('0.001'),
    });
    const hash = transferTransaction.txHash;
    history(amountValue || 0, hash, addressValue, 'transfer');
    setHash(hash);
    const receipt = await transferTransaction.awaitReceipt();
    transactions(receipt);
  }, [addressValue, amountValue, history, transactions, zkWallet]);

  const withdraw = useCallback(async () => {
    setLoading(true);
    const withdrawTransaction = await zkWallet.withdrawTo({
      ethAddress: addressValue,
      token: TOKEN,
      amount: ethers.utils.parseEther(amountValue ? amountValue?.toString() : '0'),
      fee: ethers.utils.parseEther('0.001'),
    });
    const hash = withdrawTransaction.txHash;
    history(amountValue || 0, hash, addressValue, 'withdraw');
    setHash(hash);
    const receipt = await withdrawTransaction.awaitReceipt();
    transactions(receipt);
  }, [addressValue, amountValue, history, setHash, setLoading, transactions, zkWallet]);

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
