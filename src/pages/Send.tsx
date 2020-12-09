import React from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from 'src/store/context';

import Transaction from 'components/Transaction/Transaction';

import { useCheckLogin } from 'src/hooks/useCheckLogin';
import { useTransaction } from 'hooks/transactions/useTransaction';
import { loadTokens } from 'src/utils';

export const Send: React.FC = observer(
  (): JSX.Element => {
    const { transfer } = useTransaction();

    const store = useStore();

    const { TokensStore } = store;

    useCheckLogin();

    return (
      <Transaction
        balances={TokensStore.zkBalances}
        isInput={true}
        propsMaxValue={undefined}
        propsSymbolName={undefined}
        propsToken={undefined}
        price={TokensStore.tokenPrices}
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
