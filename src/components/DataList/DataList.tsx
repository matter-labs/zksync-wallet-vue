import React, { useEffect, useState, useCallback } from 'react';

import useLocalStorage from '../../hooks/useLocalStorage';
import { useRootData } from '../../hooks/useRootData';

import { IBalances } from './Types';
import { IEthBalance } from '../../types/Common';

import Modal from '../Modal/Modal';
import SaveContacts from '../SaveContacts/SaveContacts';

import { request } from '../../functions/Request';

import { BASE_URL, CURRENCY, CONVERT_CURRENCY } from '../../constants/CoinBase';
import { DEFAULT_ERROR } from '../../constants/errors';

import './DataList.scss';

const DataList: React.FC<IBalances> = ({ title, visible }): JSX.Element => {
  const { error, isModalOpen, setError, setModal, zkBalances } = useRootData(
    ({ error, isModalOpen, setError, setModal, zkBalances }) => ({
      error: error.get(),
      isModalOpen: isModalOpen.get(),
      setError,
      setModal,
      zkBalances: zkBalances.get(),
    }),
  );

  const data = useLocalStorage('contacts');

  const [searchContacts, setContacts] = useState<object>(data);
  const [searchBalances, setBalances] = useState<IEthBalance[]>(zkBalances);
  const [price, setPrice] = useState<number>(0);

  console.log(data);

  useEffect(() => {
    setBalances(zkBalances);
    setContacts(data);
    request(`${BASE_URL}/${CURRENCY}/?convert=${CONVERT_CURRENCY}`)
      .then((res: any) => {
        setPrice(+res?.[0]?.price_usd);
      })
      .catch(err => {
        err.name && err.message ? setError(`${err.name}:${err.message}`) : setError(DEFAULT_ERROR);
      });
  }, [error, setError, setPrice, zkBalances]);

  const handleSearch = useCallback(
    e => {
      const searchQuery = e.target.value.toLowerCase();
      const displayedBalances = zkBalances.filter(el => {
        const searchValue = `zk${el.symbol}`.toLowerCase();
        return searchValue.indexOf(searchQuery) !== -1;
      });
      setBalances(displayedBalances);
    },
    [zkBalances],
  );

  return (
    <>
      <Modal visible={false} classSpecifier="add-contact" background={true} cancelAction={() => null}>
        <SaveContacts address="address" />
      </Modal>
      <div className={`balances-wrapper ${visible ? 'open' : 'closed'}`}>
        <h3 className="balances-title">{title}</h3>
        <input onChange={e => handleSearch(e)} placeholder="Search token" className="balances-search" type="text" />
        {title === 'Token balances' &&
          !!searchBalances &&
          searchBalances.map(({ symbol, balance }) => (
            <div className="balances-token">
              <div>zk{symbol}</div>
              <div>
                {balance} <span>(~${balance * price})</span>
              </div>
            </div>
          ))}
        {title === 'Contacts' && data && (
          <>
            <button className="add-contact-button" onClick={() => setModal('add-contact')}>
              <span></span>
              <p>Add a contact</p>
            </button>
            {Array.isArray(data) ? (
              data.map(({ address, name }) => (
                <div className="balances-contact" key={address}>
                  <div className="balances-contact-left">
                    <span className="balances-contact-name">{name}</span>
                    <span className="balances-contact-address">
                      {address?.replace(address?.slice(6, address?.length - 3), '...')}
                    </span>
                  </div>
                  <div className="balances-contact-right">
                    <button className="balances-contact-send"></button>
                    <button className="balances-contact-copy"></button>
                    <button className="balances-contact-edit">
                      <span></span>
                      <span></span>
                      <span></span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div>{data}</div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default DataList;
