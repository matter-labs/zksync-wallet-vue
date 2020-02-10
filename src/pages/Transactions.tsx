import React from 'react';

import useLocalStorage from '../hooks/useLocalStorage';

const Transactions: React.FC = (): JSX.Element => {
  const data = useLocalStorage('history');
  return (
    <div>
      {data && (
        <>
          {Array.isArray(data) ? (
            data.map(({ amount, date, hash, to }) => (
              <div key={hash}>
                <span>
                  {amount}&nbsp;|| {date}&nbsp;|| {hash}&nbsp;|| {to}
                </span>
              </div>
            ))
          ) : (
            <div>{data}</div>
          )}
        </>
      )}
    </div>
  );
};

export default Transactions;
