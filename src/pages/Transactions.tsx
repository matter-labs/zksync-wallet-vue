import React from 'react';

import { useRootData } from '../hooks/useRootData';

import DataList from '../components/DataList/DataList';

const Transactions: React.FC = (): JSX.Element => {
  const { searchTransactions } = useRootData(({ searchTransactions }) => ({
    searchTransactions: searchTransactions.get(),
  }));

  const arrTransactions: any = localStorage.getItem('history');
  const transactions = JSON.parse(arrTransactions);

  return (
    <DataList title="Transactions" visible={true}>
      {transactions ? (
        searchTransactions?.map(({ amount, type, hash, to }) => (
          <div className="transaction-history-wrapper" key={hash}>
            <div className="transaction-history-left">
              <div className={`transaction-history ${type}`}></div>
              <div className="transaction-history-amount">{amount}</div>
              <div className="transaction-history-hash">{hash}</div>
            </div>
            <div className="transaction-history-right">
              <div className="transaction-history-address">
                {type === 'transfer' && (
                  <>
                    <span>Sent to:</span>
                    <p>{to?.replace(to?.slice(6, to?.length - 3), '..')}</p>
                  </>
                )}
                {type === 'deposit' && (
                  <>
                    <span>Deposited to:</span>
                    <p>Your account</p>
                  </>
                )}
                {type === 'withdraw' && (
                  <>
                    <span>Withdrawed to:</span>
                    <p>{to?.replace(to?.slice(6, to?.length - 3), '..')}</p>
                  </>
                )}
              </div>
              <button className="balances-contact-edit">
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </div>
        ))
      ) : (
        <div>History is empty</div>
      )}
    </DataList>
  );
};

export default Transactions;
