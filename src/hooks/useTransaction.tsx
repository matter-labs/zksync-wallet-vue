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
      setHash(hash);
      const receipt = await depositPriorityOperation.awaitReceipt();
      transactions(receipt);
    } catch (err) {
      console.error(err);
    }
  }, [amountValue, ethWallet, setHash, setLoading, transactions, zkWallet]);

  const transfer = useCallback(async () => {
    setLoading(true);
    const transferTransaction = await zkWallet.syncTransfer({
      to: addressValue,
      token: TOKEN,
      amount: ethers.utils.parseEther(amountValue ? amountValue.toString() : '0'),
      fee: ethers.utils.parseEther('0.001'),
    });
    const hash = transferTransaction.txHash;
    setHash(hash);
    console.log(transferTransaction);
    const receipt = await transferTransaction.awaitReceipt();
    transactions(receipt);
  }, [addressValue, amountValue, transactions, zkWallet]);

  const withdraw = useCallback(async () => {
    setLoading(true);
    const withdrawTransaction = await zkWallet.withdrawTo({
      ethAddress: addressValue,
      token: TOKEN,
      amount: ethers.utils.parseEther(amountValue ? amountValue?.toString() : '0'),
      fee: ethers.utils.parseEther('0.001'),
    });
    const hash = withdrawTransaction.txHash;
    setHash(hash);
    const receipt = await withdrawTransaction.awaitReceipt();
    transactions(receipt);
  }, [addressValue, amountValue, setHash, setLoading, transactions, zkWallet]);

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
