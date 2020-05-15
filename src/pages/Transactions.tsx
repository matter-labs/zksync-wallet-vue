import React, { useMemo, useCallback } from 'react';
import { ethers } from 'ethers';
import { useObserver, observer } from 'mobx-react-lite';

import { CURRENT_NETWORK_PREFIX } from 'constants/networks';

import { DataList } from 'components/DataList/DataListNew';
import { useCheckLogin } from 'hooks/useCheckLogin';
import { getConfirmationCount } from 'src/utils';
import { Transaction } from './Transaction';
import { useStore } from 'src/store/context';

export interface Tx {
  hash: string;
  pq_id?: any;
  tx: {
    amount: string;
    fee: string;
    from: string;
    nonce: number;
    priority_op?: {
      amount: string;
      from: string;
      to: string;
      token: number;
    };
    signature: {
      pubKey: string;
      signature: string;
    };
    to?: string;
    token?: number;
    type: 'Transfer' | 'Withdraw' | 'Deposit' | 'ChangePubKey';
  };
  success: boolean;
  fail_reason?: any;
  commited: boolean;
  verified: boolean;
  confirmCount: number;
}

const Transactions: React.FC = observer(() => {
  const store = useStore();

  const web3Provider = useMemo(
    () => store.provider && new ethers.providers.Web3Provider(store.provider),
    [store],
  );

  const fetchTransactions = useCallback(
    async (amount, offset): Promise<Tx[]> => {
      const txs: Tx[] = await fetch(
        `https://${CURRENT_NETWORK_PREFIX}-api.zksync.dev/api/v0.1/account/` +
          `${store.zkWalletAddress}/history/${offset}/${amount}`,
      ).then(r => r.json());

      const resolvedTxs = await Promise.all(
        txs.map(async tx =>
          Object.assign(tx, {
            confirmCount: await getConfirmationCount(web3Provider, tx.hash),
          }),
        ),
      );
      return resolvedTxs.filter(tx => tx.tx.type !== 'ChangePubKey');
    },
    [store.zkWalletAddress, web3Provider],
  );

  const setTxs = useCallback(store.setTxs.bind(store), [store]);

  useCheckLogin();

  return (
    <DataList
      onFetch={fetchTransactions}
      bindData={[store.transactions, setTxs]}
      title='Transactions'
      visible={true}
      onSort={arr => arr.slice().reverse()}
      renderItem={tx => <Transaction key={tx.hash} {...tx} />}
      emptyListComponent={() => (
        <div className='default-text'>{'History is empty'}</div>
      )}
      infScrollInitialCount={30}
      refreshInterval={store.zkWallet ? 2e3 : 0}
    />
  );
});

export default Transactions;
