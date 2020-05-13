import React from 'react';
import { observer } from 'mobx-react-lite';

import Transaction from 'components/Transaction/Transaction';

import { useTransaction } from 'hooks/useTransaction';
import { useCheckLogin } from 'src/hooks/useCheckLogin';
import { useStore } from 'src/store/context';

export const Withdraw: React.FC = observer(
  (): JSX.Element => {
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
        price={price}
        setHash={setHash}
        setExecuted={setExecuted}
        setLoading={setLoading}
        setTransactionType={t => (store.transactionType = t)}
        setSymbol={setSymbol}
        title='Withdraw'
        transactionAction={withdraw}
        type='eth'
      />
    );
  },
);
