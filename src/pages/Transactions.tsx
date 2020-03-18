import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { useRootData } from '../hooks/useRootData';

import DataList from '../components/DataList/DataList';

const Transactions: React.FC = (): JSX.Element => {
  const dataPropertyName = 'to';

  const { ethId, provider, searchTransactions, setTransactions, zkWallet } = useRootData(
    ({ ethId, provider, searchTransactions, setTransactions, zkWallet }) => ({
      ethId: ethId.get(),
      provider: provider.get(),
      searchTransactions: searchTransactions.get(),
      setTransactions,
      zkWallet: zkWallet.get(),
    }),
  );

  const networks = {
    1: 'main',
    3: 'ropsten',
    42: 'kovan',
    4: 'rinkeby',
    5: 'goerly',
  };

  const history = useHistory();

  const arrTransactions: any = localStorage.getItem(`history${zkWallet?.address()}`);
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
          <div className="transaction-history-wrapper" onClick={() => console.log(hash)} key={hash}>
            <div className="transaction-history-left">
              <div className={`transaction-history ${type}`}></div>
              <div className="transaction-history-amount">{+amount.toFixed(3)}</div>
              <div className="transaction-history-hash">
                {token && token.length > 10 ? token.replace(token.slice(6, token.length - 3), '...') : <>zk{token}</>}
              </div>
            </div>
            <div className="transaction-history-right">
              <div className="transaction-history-address">
                {type === 'transfer' && (
                  <>
                    <span>Sent to:</span>
                    <p>{to?.replace(to?.slice(6, to?.length - 3), '...')}</p>
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
                    <p>{to?.replace(to?.slice(6, to?.length - 3), '...')}</p>
                  </>
                )}
              </div>
              <div className="contact-edit-wrapper">
                <input type="radio" className="balances-contact-edit" />
                <div className="contact-manage">
                  <a
                    target="_blank"
                    href={`https://${
                      provider && provider.networkVersion !== '1' ? `${networks[provider.networkVersion]}.` : ''
                    }etherscan.io/tx/${hash.replace(/.*?(:)/, '0x')}`}
                  >
                    View info on etherscan
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="default-text">History is empty</div>
      )}
    </DataList>
  );
};

export default Transactions;
