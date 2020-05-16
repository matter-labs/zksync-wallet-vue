import React, { useMemo, useCallback } from 'react';
import { ethers } from 'ethers';
import { observer } from 'mobx-react-lite';

import { CURRENT_NETWORK_PREFIX } from 'constants/networks';
import { DataList } from 'components/DataList/DataListNew';
import { getConfirmationCount } from 'src/utils';

import { Transaction } from './Transaction';
import { useStore } from 'src/store/context';
import Spinner from 'src/components/Spinner/Spinner';
import { useInfiniteScroll } from 'hooks/useInfiniteScroll';

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
  created_at: Date;
}

const renderTx = (tx: Tx) => (
  <Transaction key={tx.hash + tx.tx.amount} {...tx} />
);
const filterPredicate = (tx: Tx) => tx.tx.type !== 'ChangePubKey';
const onSort = arr => arr.slice().reverse();

const Transactions: React.FC = observer(() => {
  const store = useStore();

  const web3Provider = useMemo(
    () => store.provider && new ethers.providers.Web3Provider(store.provider),
    [store],
  );

  const fetchTransactions = useCallback(
    async (amount, offset) => {
      const { zkWalletAddress } = store;
      if (!zkWalletAddress) return [];
      const txs = await fetch(
        `https://${CURRENT_NETWORK_PREFIX}-api.zksync.dev/api/v0.1/account/` +
          `${zkWalletAddress}/history/${offset}/${amount}`,
      )
        .then(r => r.json())
        .catch(() => []);

      const resolvedTxs = await Promise.all(
        txs.map(async tx =>
          Object.assign(tx, {
            confirmCount: await getConfirmationCount(web3Provider, tx.hash),
            created_at: new Date(tx.created_at),
          }),
        ),
      );
      return resolvedTxs as Tx[];
    },
    [web3Provider, store],
  );

  const { isLoadingMore } = useInfiniteScroll(fetchTransactions);

  return (
    <div>
      <DataList
        data={store.transactions}
        title='Transactions'
        onSort={onSort}
        renderItem={renderTx}
        emptyListComponent={() => (
          <div className='default-text'>{'History is empty'}</div>
        )}
        filterPredicate={filterPredicate}
      />
      {isLoadingMore && <Spinner />}
    </div>
  );
});

export default Transactions;
