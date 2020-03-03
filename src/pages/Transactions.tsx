import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { useRootData } from '../hooks/useRootData';

import DataList from '../components/DataList/DataList';

const Transactions: React.FC = (): JSX.Element => {
  const dataPropertyName = 'to';

  const { ethId, searchTransactions, setTransactions } = useRootData(
    ({ ethId, searchTransactions, setTransactions }) => ({
      ethId: ethId.get(),
      searchTransactions: searchTransactions.get(),
      setTransactions,
    }),
  );

  const history = useHistory();

  const arrTransactions: any = localStorage.getItem('history');
  const transactions = JSON.parse(arrTransactions);

  useEffect(() => {
    if (!ethId) {
      window.location.pathname = '/';
      history.push('/');
    }
  }, [ethId, history]);

  return (
    <DataList
      setValue={setTransactions}
      dataProperty={dataPropertyName}
      data={transactions}
      title="Transactions"
      visible={true}
    >
      {transactions ? (
        searchTransactions?.map(({ amount, type, hash, to, token }) => (
          <div className="transaction-history-wrapper" key={hash}>
            <div className="transaction-history-left">
              <div className={`transaction-history ${type}`}></div>
              <div className="transaction-history-amount">{+amount.toFixed(3)}</div>
              <div className="transaction-history-hash">
                {token.length > 5 ? token.replace(token.slice(6, token.length - 3), '...') : <>zk{token}</>}
              </div>
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
