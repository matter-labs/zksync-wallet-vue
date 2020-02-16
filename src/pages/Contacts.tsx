import React from 'react';

import { useRootData } from '../hooks/useRootData';

import DataList from '../components/DataList/DataList';

const Contacts: React.FC = (): JSX.Element => {
  const { searchContacts, setModal } = useRootData(({ searchContacts, setModal }) => ({
    searchContacts: searchContacts.get(),
    setModal,
  }));

  const arr: any = localStorage.getItem('contacts');
  const contacts = JSON.parse(arr);

  return (
    <DataList title="Contacts" visible={true}>
      {contacts && (
        <>
          <button className="add-contact-button" onClick={() => setModal('add-contact addressless')}>
            <span></span>
            <p>Add a contact</p>
          </button>
          {!!searchContacts ? (
            searchContacts.map(({ address, name }) => (
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
            <div>You don't have contacts yet...</div>
          )}
        </>
      )}
    </DataList>
  );
};

export default Contacts;
