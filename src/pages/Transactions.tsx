import React, { useMemo, useCallback } from 'react';

import { DataList } from 'components/DataList/DataListNew';
import { useRootData } from 'hooks/useRootData';
import { useCheckLogin } from 'hooks/useCheckLogin';
import { ethers } from 'ethers';
import { getConfirmationCount } from 'src/utils';
import { Transaction } from './Transaction';

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
  const { zkWallet, provider, transactions, setTxs } = useRootData(s => ({
    ...s,
    ethId: s.ethId.get(),
    provider: s.provider.get(),
    searchTransactions: s.searchTransactions.get(),
    zkWallet: s.zkWallet.get(),
    transactions: s.transactions.toJS(),
  }));

  const web3Provider = useMemo(
    () => provider && new ethers.providers.Web3Provider(provider),
    [provider],
  );

  const fetchTransactions = useCallback(
    async (amount, offset): Promise<Tx[]> => {
      const txs: Tx[] = await fetch(
        `https://testnet.zksync.dev/api/v0.1/account/${zkWallet?.address()}/history/${offset}/${amount}`,
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
    [zkWallet, web3Provider],
  );

  useCheckLogin();

  return (
    <DataList
      onFetch={fetchTransactions}
      bindData={[transactions, setTxs]}
      title='Transactions'
      visible={true}
      onSort={arr => arr.reverse()}
      renderItem={tx => <Transaction key={tx.hash} {...tx} />}
      emptyListComponent={() => (
        <div className='default-text'>{'History is empty'}</div>
      )}
      infScrollInitialCount={10}
    />
  );
};

export default Transactions;
