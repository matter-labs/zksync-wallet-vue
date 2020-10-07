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
      setAddressValue,
      setAmountValue,
      setExecuted,
      setHash,
      setSymbol,
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
        onChangeAddress={(e: string) => setAddressValue(e)}
        onChangeAmount={setAmountValue}
        propsMaxValue={undefined}
        propsSymbolName={undefined}
        propsToken={undefined}
        price={price}
        setHash={setHash}
        setExecuted={setExecuted}
        setSymbol={setSymbol}
        setTransactionType={t => {
          store.transactionType = t;
        }}
        title='Transfer'
        transactionAction={transfer}
        type='sync'
      />
    );
  },
);
