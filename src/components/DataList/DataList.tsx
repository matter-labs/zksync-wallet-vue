import React, { useEffect, useCallback } from 'react';

import { useRootData } from '../../hooks/useRootData';

import { IBalances } from './Types';

import Modal from '../Modal/Modal';
import SaveContacts from '../SaveContacts/SaveContacts';

import './DataList.scss';

const DataList: React.FC<IBalances> = ({ children, title, visible }): JSX.Element => {
  const { setBalances, setContacts, setModal, zkBalances } = useRootData(
    ({ setBalances, setContacts, setModal, zkBalances }) => ({
      setBalances,
      setContacts,
      setModal,
      zkBalances: zkBalances.get(),
    }),
  );

  const arr: any = localStorage.getItem('contacts');
  const contacts = JSON.parse(arr);

  useEffect(() => {
    setContacts(contacts);
    setBalances(zkBalances);
  }, [contacts, setBalances, setContacts, zkBalances]);

  const handleSearch = useCallback(
    e => {
      const searchQuery = e.target.value.toLowerCase();
      if (title === 'Token balances') {
        const displayedBalances = zkBalances.filter(el => {
          const searchValue = `zk${el.symbol}`.toLowerCase();
          return searchValue.indexOf(searchQuery) !== -1;
        });
        setBalances(displayedBalances);
      } else if (title === 'Contacts') {
        const displayedContacts = contacts.filter(el => {
          const searchValue = el.name.toLowerCase();
          return searchValue.indexOf(searchQuery) !== -1;
        });
        setContacts(displayedContacts);
      }
    },
    [contacts, setBalances, setContacts, title, zkBalances],
  );

  return (
    <>
      <Modal visible={false} classSpecifier="add-contact addressless" background={true} cancelAction={() => null}>
        <SaveContacts addressValue="" addressInput={true} />
      </Modal>
      <div className={`balances-wrapper ${visible ? 'open' : 'closed'}`}>
        <h3 className="balances-title">{title}</h3>
        <input onChange={e => handleSearch(e)} placeholder="Search token" className="balances-search" type="text" />
        {children}
        {title === 'Contacts' && (
          <button className="add-contact-button" onClick={() => setModal('add-contact addressless')}>
            <span></span>
            <p>Add a contact</p>
          </button>
        )}
        {/* {title === 'Transactions' && history && (
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
        )} */}
      </div>
    </>
  );
};

export default DataList;
