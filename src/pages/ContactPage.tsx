import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { ethers } from 'ethers';

import { DataList } from 'components/DataList/DataListNew';
import Spinner from 'src/components/Spinner/Spinner';
import { Tx } from 'src/pages/Transactions';
import { Transaction } from './Transaction';
import { ContactInfo } from 'src/components/ContactInfo/ContactInfo';

import { useStore } from 'src/store/context';
import { useInfiniteScroll } from 'hooks/useInfiniteScroll';

import { LINKS_CONFIG } from 'src/config';

const filterPredicate = (tx: Tx) => tx.tx.type !== 'ChangePubKey';
const onSort = (arr: Tx[]) =>
  arr.slice().sort((a, b) => (a.created_at > b.created_at ? -1 : 1));

export const ContactPage = observer(() => {
  const store = useStore();

  const [deletedContact, setDeletedContact] = useState<any>();
  const [contacts, setContacts] = useState<any>();

  const updateContactList = useCallback(() => {
    const arr: string | null = window.localStorage?.getItem(
      `contacts${store.zkWallet?.address()}`,
    );
    setContacts(JSON.parse(arr as string));
  }, [setContacts, store.zkWallet]);
  useEffect(updateContactList, [
    setContacts,
    store.zkWallet,
    deletedContact,
    setDeletedContact,
  ]);

  const renderTx = (tx: Tx) => {
    return (
      (tx.tx.type === 'Deposit'
        ? tx.tx.priority_op?.to.toLowerCase()
        : tx.tx.to?.toLowerCase()) ===
        (store.newContactAddress
          ? store.newContactAddress
          : store.walletAddress.address
        )?.toLowerCase() && <Transaction key={tx.hash + tx.tx.amount} {...tx} />
    );
  };

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
                  t.tx.priority_op.to?.toLowerCase() ===
                  (store.newContactAddress
                    ? store.newContactAddress
                    : store.walletAddress.address
                  )?.toLowerCase()
                );
              } else {
                return (
                  t.tx.to?.toLowerCase() ===
                  (store.newContactAddress
                    ? store.newContactAddress
                    : store.walletAddress.address
                  )?.toLowerCase()
                );
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
          } else if (res.length === store.transactions.length) {
            store.transactions = res;
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

  const returnDeletedContact = useCallback(() => {
    const _c = contacts;
    _c.splice(deletedContact?.index, 0, {
      name: deletedContact?.name,
      address: deletedContact?.address,
    });
    window.localStorage?.setItem(
      `contacts${store.zkWallet?.address()}`,
      JSON.stringify(_c),
    );
    store.newContactName = deletedContact?.name;
    store.walletAddress.name = deletedContact?.name;
    store.newContactAddress = deletedContact?.address;
    store.walletAddress.address = deletedContact?.address;
    updateContactList();
    setDeletedContact(undefined);
  }, [contacts, deletedContact, store.zkWallet]);

  return (
    <>
      {!!deletedContact && (
        <p className='undo-text'>
          {`Contact "${deletedContact.name}" deleted.`}
          <span onClick={returnDeletedContact} className='undo-btn'>
            {'Undo'}
          </span>
        </p>
      )}
      <ContactInfo
        deletedContact={deletedContact}
        setDeletedContact={setDeletedContact}
      />
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
    </>
  );
});
