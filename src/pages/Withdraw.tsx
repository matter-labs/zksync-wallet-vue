import React from 'react';
import { observer } from 'mobx-react-lite';


import Transaction from 'components/Transaction/Transaction';

import { useWithdraw } from 'hooks/transactions/useWithdraw';
import { useCheckLogin } from 'src/hooks/useCheckLogin';
import { useStore } from 'src/store/context';
import { loadTokens } from 'src/utils';

export const Withdraw: React.FC = observer(
  (): JSX.Element => {
    const { withdraw } = useWithdraw();

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
        setTransactionType={t => (store.transactionType = t)}
        title='Withdraw'
        transactionAction={withdraw}
        type='eth'
      />
    );
  },
);
