import React, { useEffect, useState, useCallback } from 'react';

import { useRootData } from '../../hooks/useRootData';

import { IEthBalance } from '../../types/Common';
import { IBalances } from './Types';

import { request } from '../../functions/Request';

import { BASE_URL, CURRENCY, CONVERT_CURRENCY } from '../../constants/CoinBase';
import { DEFAULT_ERROR } from '../../constants/errors';

import './Balances.scss';

const Balances: React.FC<IBalances> = ({ visible }): JSX.Element => {
  const { error, setError, zkBalances } = useRootData(({ error, setError, zkBalances }) => ({
    error: error.get(),
    setError,
    zkBalances: zkBalances.get(),
  }));

  const [searchData, setSearchValue] = useState<IEthBalance[]>(zkBalances);
  const [price, setPrice] = useState<number>(0);

  useEffect(() => {
    request(`${BASE_URL}/${CURRENCY}/?convert=${CONVERT_CURRENCY}`)
      .then((res: any) => {
        setPrice(+res?.[0]?.price_usd);
      })
      .catch(err => {
        err.name && err.message ? setError(`${err.name}:${err.message}`) : setError(DEFAULT_ERROR);
      });
  }, [error, setError, setPrice]);

  const handleSearch = useCallback(
    e => {
      const searchQuery = e.target.value.toLowerCase();
      const displayedBalances = zkBalances.filter(el => {
        const searchValue = `zk${el.symbol}`.toLowerCase();
        return searchValue.indexOf(searchQuery) !== -1;
      });
      setSearchValue(displayedBalances);
    },
    [zkBalances],
  );

  return (
    <div className={`balances-wrapper ${visible ? 'open' : 'closed'}`}>
      <h3 className="balances-title">Token balances</h3>
      <input onChange={e => handleSearch(e)} placeholder="Search token" className="balances-search" type="text" />
      {searchData?.length &&
        searchData.map(({ symbol, balance }) => (
          <div className="balances-token">
            <div>zk{symbol}</div>
            <div>
              {balance} <span>(~${balance * price})</span>
            </div>
          </div>
        ))}
    </div>
  );
};

export default Balances;
