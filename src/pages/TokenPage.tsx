import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { ethers } from 'ethers';

import { DataList } from 'components/DataList/DataListNew';
import Spinner from 'src/components/Spinner/Spinner';
import { Tx } from 'src/pages/Transactions';
import { Transaction } from './Transaction';
import { TokenInfo } from 'src/components/TokenInfo/TokenInfo';

import { useStore } from 'src/store/context';
import { useInfiniteScroll } from 'hooks/useInfiniteScroll';

import { LINKS_CONFIG } from 'src/config';

const filterPredicate = (tx: Tx) => tx.tx.type !== 'ChangePubKey';
const onSort = (arr: Tx[]) =>
  arr.slice().sort((a, b) => (a.created_at > b.created_at ? -1 : 1));

export const TokenPage = observer(() => {
  const store = useStore();

  const { TransactionStore } = store;

  const renderTx = (tx: Tx) => {
    return (
      (tx.tx.type === 'Deposit' ? tx.tx.priority_op?.token : tx.tx.token) ===
        TransactionStore.propsSymbolName && (
        <Transaction key={tx.hash + tx.tx.amount} {...tx} />
      )
    );
  };

  const web3Provider = useMemo(
    () => store.provider && new ethers.providers.Web3Provider(store.provider),
    [store],
  );

  const fetchTransactions = useCallback(
    async (amount, offset) => {
      const { zkWalletAddress } = store;
      if (!zkWalletAddress) return [];

      const txs = await fetch(
        `https://${LINKS_CONFIG.api}/api/v0.1/account/` +
          `${zkWalletAddress}/history/${offset}/${amount}`,
      )
        .then(r => r.json())
        .catch(err => console.log(err));
      const resolvedTxs = await Promise.all(
        txs
          .filter((tx, i) => txs.findIndex(t => t.hash === tx.hash) === i)
          .map(async tx =>
            Object.assign(tx, {
              created_at: new Date(tx.created_at),
            }),
          ),
      );
      return resolvedTxs as Tx[];
    },
    [store],
  );

  const { isLoadingMore } = useInfiniteScroll(fetchTransactions);

  let i = 25;

  const loadMore = useCallback(
    async counter => {
      fetchTransactions(counter, 0)
        .then(res => {
          i += 25;
          const filterTxs = res => {
            const filtered = res.filter(t => {
              if (t.tx.type === 'Deposit') {
                return (
                  t.tx.priority_op.token === TransactionStore.propsSymbolName
                );
              } else {
                return t.tx.token === TransactionStore.propsSymbolName;
              }
            });
            return filtered;
          };
          if (
            filterTxs(res).length <= 25 &&
            res.length > store.transactions.length
          ) {
            store.transactions = res;
            loadMore(i);
          }
        })
        .catch(err => console.error(err));
    },
    [store.transactions, fetchTransactions],
  );

  useEffect(() => {
    if (store.zkWallet) {
      loadMore(25);
    }
  }, [store.zkWallet]);

  return (
    <>
      <TokenInfo />
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
      <div className='spinner-wrapper'>{isLoadingMore && <Spinner />}</div>
    </>
  );
});
