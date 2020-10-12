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
      hash,
      isExecuted,
      setAddressValue,
      setHash,
      setExecuted,
      setSymbol,
      withdraw,
    } = useTransaction();

    const store = useStore();

    const { price, zkBalances } = store;

    useCheckLogin();

    return (
      <Transaction
        addressValue={addressValue}
        balances={zkBalances}
        hash={hash}
        isExecuted={isExecuted}
        isInput={true}
        onChangeAddress={(e: string) => setAddressValue(e)}
        price={price}
        setHash={setHash}
        setExecuted={setExecuted}
        setTransactionType={t => (store.transactionType = t)}
        setSymbol={setSymbol}
        title='Withdraw'
        transactionAction={withdraw}
        type='eth'
      />
    );
  },
);
