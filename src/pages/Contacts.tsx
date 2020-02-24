import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';

import Modal from '../components/Modal/Modal';
import SaveContacts from '../components/SaveContacts/SaveContacts';

import { useRootData } from '../hooks/useRootData';
import { useTransaction } from '../hooks/useTransaction';

import DataList from '../components/DataList/DataList';

const Contacts: React.FC = (): JSX.Element => {
  const dataPropertyName = 'name';

  const { searchContacts, setContacts, setModal, setTransactionModal, setWalletAddress } = useRootData(
    ({ searchContacts, setContacts, setModal, setTransactionModal, setWalletAddress }) => ({
      searchContacts: searchContacts.get(),
      setContacts,
      setModal,
      setTransactionModal,
      setWalletAddress,
    }),
  );

  const [addressValue, setAddressValue] = useState<string>('');

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

  const handleDelete = useCallback(name => {
    const selectedItem = contacts.findIndex(el => {
      return el.name === name;
    });
    const newContacts = contacts;
    newContacts.splice(selectedItem, 1);
    localStorage.setItem('contacts', JSON.stringify(newContacts));
    setModal('');
  }, []);

  return (
    <DataList setValue={setContacts} dataProperty={dataPropertyName} data={contacts} title="Contacts" visible={true}>
      <Modal visible={false} classSpecifier="add-contact edit-contact" background={true}>
        <SaveContacts title="Edit contact" addressValue="" addressInput={true} />
      </Modal>
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
                    onChange={undefined}
                    className="copy-block-input"
                    value={address}
                    ref={e => inputRef.push(e)}
                  />
                  <button
                    onClick={() => {
                      setAddressValue(address);
                      setModal('add-contact edit-contact');
                    }}
                    className="balances-contact-edit"
                  >
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
