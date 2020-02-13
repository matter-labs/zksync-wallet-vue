import React from 'react';

import useLocalStorage from '../hooks/useLocalStorage';

const Contacts: React.FC = (): JSX.Element => {
  const data = useLocalStorage('contacts');
  console.log(data);
  return (
    <div>
      {data && (
        <>
          {Array.isArray(data) ? (
            data.map(({ address, name }) => (
              <div key={address}>
                <span>
                  {address} &nbsp;|| {name}
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

export default Contacts;
