import React from 'react';

import Transaction from 'components/Transaction/Transaction';

import { useCheckLogin } from 'src/hooks/useCheckLogin';
import { useRootData } from 'hooks/useRootData';
import { useTransaction } from 'hooks/useTransaction';

export const Send: React.FC = (): JSX.Element => {
  const {
    addressValue,
    amountValue,
    hash,
    isExecuted,
    isLoading,
    maxValueProp,
    setAddressValue,
    setAmountValue,
    setExecuted,
    setHash,
    setLoading,
    setSymbol,
    symbolNameProp,
    tokenProp,
    transfer,
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
      propsMaxValue={maxValueProp ? maxValueProp : 0}
      propsSymbolName={symbolNameProp ? symbolNameProp : ''}
      propsToken={tokenProp ? tokenProp : ''}
      price={price}
      setHash={setHash}
      setExecuted={setExecuted}
      setLoading={setLoading}
      setSymbol={setSymbol}
      setTransactionType={setTransactionType}
      title='Send'
      transactionAction={transfer}
      type='sync'
    />
  );
};
