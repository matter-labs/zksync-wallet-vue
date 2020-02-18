import React, { useEffect, useCallback } from 'react';

import { useRootData } from '../../hooks/useRootData';

import { IBalances } from './Types';

import Modal from '../Modal/Modal';
import SaveContacts from '../SaveContacts/SaveContacts';

import './DataList.scss';

const DataList: React.FC<IBalances> = ({ children, title, visible }): JSX.Element => {
  const { setBalances, setContacts, setModal, setTransactions, zkBalances } = useRootData(
    ({ setBalances, setContacts, setModal, setTransactions, zkBalances }) => ({
      setBalances,
      setContacts,
      setModal,
      setTransactions,
      zkBalances: zkBalances.get(),
    }),
  );

  const arrContacts: any = localStorage.getItem('contacts');
  const contacts = JSON.parse(arrContacts);

  const arrTransactions: any = localStorage.getItem('history');
  const transactions = JSON.parse(arrTransactions);

  useEffect(() => {
    setContacts(contacts);
    setBalances(zkBalances);
    setTransactions(transactions);
  }, [zkBalances]);

  const handleSearch = useCallback(
    e => {
      const searchQuery = e.target.value.toLowerCase();
      if (title === 'Token balances') {
        const displayedBalances = zkBalances?.filter(el => {
          const searchValue = `zk${el.symbol}`.toLowerCase();
          return searchValue.indexOf(searchQuery) !== -1;
        });
        setBalances(displayedBalances);
      } else if (title === 'Contacts') {
        const displayedContacts = contacts?.filter(el => {
          const searchValue = el.name.toLowerCase();
          return searchValue.indexOf(searchQuery) !== -1;
        });
        setContacts(displayedContacts);
      } else if (title === 'Transactions') {
        const displayedContacts = transactions?.filter(el => {
          const searchValue = el.to.toLowerCase();
          return searchValue.indexOf(searchQuery) !== -1;
        });
        setTransactions(displayedContacts);
      }
    },
    [contacts, setBalances, setContacts, setTransactions, title, transactions, zkBalances],
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
      </div>
    </>
  );
};

export default DataList;
