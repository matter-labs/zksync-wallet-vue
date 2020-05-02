import React from 'react';

import Transaction from 'components/Transaction/Transaction';

import { useCheckLogin } from 'src/hooks/useCheckLogin';
import { useRootData } from 'hooks/useRootData';
import { useTransaction } from 'hooks/useTransaction';

export const Deposit: React.FC = (): JSX.Element => {
  const {
    addressValue,
    amountValue,
    deposit,
    hash,
    isExecuted,
    isLoading,
    setAddressValue,
    setAmountValue,
    setHash,
    setExecuted,
    setLoading,
    setSymbol,
  } = useTransaction();

  const { ethBalances, price, setTransactionType } = useRootData(
    ({ ethBalances, price, setTransactionType }) => ({
      ethBalances: ethBalances.get(),
      price: price.get(),
      setTransactionType,
    }),
  );

  useCheckLogin();

  return (
    <Transaction
      addressValue={addressValue}
      amountValue={amountValue}
      balances={ethBalances}
      hash={hash}
      isExecuted={isExecuted}
      isInput={false}
      isLoading={isLoading}
      onChangeAddress={(e: string) => setAddressValue(e)}
      onChangeAmount={setAmountValue}
      price={price}
      setHash={setHash}
      setExecuted={setExecuted}
      setLoading={setLoading}
      setSymbol={setSymbol}
      setTransactionType={setTransactionType}
      title='Deposit'
      transactionAction={deposit}
    />
  );
};
