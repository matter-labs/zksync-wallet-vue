import React from 'react';

import useLocalStorage from '../hooks/useLocalStorage';
import DataList from '../components/DataList/DataList';

const Transactions: React.FC = (): JSX.Element => {
  const history = useLocalStorage('history');
  return (
    <DataList title="Transactions" visible={true}>
      {history && (
        <>
          {Array.isArray(history) ? (
            history.map(({ amount, date, hash, to }) => (
              <div key={hash}>
                <span>
                  {amount}&nbsp;|| {date}&nbsp;|| {hash}&nbsp;|| {to}
                </span>
              </div>
            ))
          ) : (
            <div>{history}</div>
          )}
        </>
      )}
    </DataList>
  );
};

export default Transactions;
