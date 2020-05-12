import React from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from 'src/store/context';

import Transaction from 'components/Transaction/Transaction';

import { useCheckLogin } from 'src/hooks/useCheckLogin';
import { useTransaction } from 'hooks/useTransaction';

export const Send: React.FC = observer(
  (): JSX.Element => {
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

    const store = useStore();

    const { price, zkBalances } = store;

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
        setTransactionType={t => {
          store.transactionType = t;
        }}
        title='Send'
        transactionAction={transfer}
        type='sync'
      />
    );
  },
);
