import React, { useCallback } from 'react';

import { Link } from 'react-router-dom';

import { useRootData } from '../hooks/useRootData';
import { useTransaction } from '../hooks/useTransaction';

import DataList from '../components/DataList/DataList';

const Contacts: React.FC = (): JSX.Element => {
  const { searchContacts, setModal, setTransactionModal, setWalletAddress } = useRootData(
    ({ searchContacts, setModal, setTransactionModal, setWalletAddress }) => ({
      searchContacts: searchContacts.get(),
      setModal,
      setTransactionModal,
      setWalletAddress,
    }),
  );

  const arr: any = localStorage.getItem('contacts');
  const contacts = JSON.parse(arr);

  const { transfer } = useTransaction();

  const inputRef: (HTMLInputElement | null)[] = [];

  const handleCopy = useCallback(
    address => {
      inputRef.map(el => {
        if (address === el?.value) {
          el?.focus();
          el?.select();
          document.execCommand('copy');
        }
      });
    },
    [inputRef],
  );

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
              <div className="balances-contact" key={name}>
                <div className="balances-contact-left">
                  <span className="balances-contact-name">{name}</span>
                  <span className="balances-contact-address">
                    {address?.replace(address?.slice(6, address?.length - 3), '...')}
                  </span>
                </div>
                <div className="balances-contact-right">
                  <button
                    className="balances-contact-send"
                    onClick={() => {
                      setTransactionModal({ title: 'Send', input: true, action: transfer });
                      setWalletAddress(address);
                    }}
                  >
                    <Link to="/"></Link>
                  </button>
                  <button className="balances-contact-copy" onClick={() => handleCopy(address)}></button>
                  <input
                    onChange={() => console.log(null)}
                    className="copy-block-input"
                    value={address}
                    ref={e => inputRef.push(e)}
                  />
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
