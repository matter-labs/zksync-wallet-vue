import React, { useMemo, useCallback } from 'react';

import { DataList } from 'components/DataList/DataListNew';
import { useRootData } from 'hooks/useRootData';
import { useCheckLogin } from 'hooks/useCheckLogin';
import { ethers } from 'ethers';
import { getConfirmationCount } from 'src/utils';
import { Transaction } from './Transaction';
import { useStore } from 'src/store/context';
import { useObserver } from 'mobx-react-lite';

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

const Transactions: React.FC = (): JSX.Element => {
  const store = useStore();
  // const { zkWallet, provider } = useRootData(s => ({
  //   provider: s.provider.get(),
  //   zkWallet: s.zkWallet.get(),
  // }));

  const web3Provider = useMemo(
    () => store.provider && new ethers.providers.Web3Provider(store.provider),
    [store],
  );

  const fetchTransactions = useCallback(
    async (amount, offset): Promise<Tx[]> => {
      const txs: Tx[] = await fetch(
        'https://testnet.zksync.dev/api/v0.1/account/' +
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

  useCheckLogin();

  return useObserver(() => (
    <DataList
      onFetch={fetchTransactions}
      bindData={[store.transactions, store.setTxs.bind(store)]}
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
  ));
};

export default Transactions;
