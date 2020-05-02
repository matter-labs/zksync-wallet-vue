import React from 'react';
import { useCheckLogin } from 'src/hooks/useCheckLogin';

import Transaction from 'components/Transaction/Transaction';

import { useRootData } from 'hooks/useRootData';
import { useTransaction } from 'hooks/useTransaction';

export const Withdraw: React.FC = (): JSX.Element => {
  const {
    addressValue,
    amountValue,
    hash,
    isExecuted,
    isLoading,
    setAddressValue,
    setAmountValue,
    setHash,
    setExecuted,
    setLoading,
    setSymbol,
    withdraw,
  } = useTransaction();

  const { price, setTransactionType, zkBalances } = useRootData(
    ({ price, setTransactionType, zkBalances }) => ({
      price: price.get(),
      setTransactionType,
      zkBalances: zkBalances.get(),
    }),
  );

  useCheckLogin();

  return (
    <Transaction
      addressValue={addressValue}
      amountValue={amountValue}
      balances={zkBalances}
      hash={hash}
      isExecuted={isExecuted}
      isInput={true}
      isLoading={isLoading}
      onChangeAddress={(e: string) => setAddressValue(e)}
      onChangeAmount={setAmountValue}
      price={price}
      setHash={setHash}
      setExecuted={setExecuted}
      setLoading={setLoading}
      setTransactionType={setTransactionType}
      setSymbol={setSymbol}
      title='Withdraw'
      transactionAction={withdraw}
      type='eth'
    />
  );
};
