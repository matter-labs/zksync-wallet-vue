import React from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from 'src/store/context';

import Transaction from 'components/Transaction/Transaction';

import { useCheckLogin } from 'src/hooks/useCheckLogin';
import { useDeposit } from 'hooks/transactions/useDeposit';
import { loadTokens } from 'src/utils';

export const Deposit: React.FC = observer(
  (): JSX.Element => {
    const { deposit } = useDeposit();

    const store = useStore();

    const { TokensStore } = store;

    useCheckLogin();

    return (
      <Transaction
        balances={TokensStore.ethBalances}
        isInput={false}
        price={TokensStore.tokenPrices}
        setTransactionType={t => {
          store.transactionType = t;
        }}
        title='Deposit'
        transactionAction={deposit}
      />
    );
  },
);
