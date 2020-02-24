import React, { useCallback, useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

import Modal from '../components/Modal/Modal';
import SaveContacts from '../components/SaveContacts/SaveContacts';
import editicon from '../images/icon-edit.svg';
import deleteicon from '../images/mdi_delete.svg';

import { useRootData } from '../hooks/useRootData';

import DataList from '../components/DataList/DataList';

const Contacts: React.FC = (): JSX.Element => {
  const dataPropertyName = 'name';

  const { ethId, searchContacts, setContacts, setModal, setTransactionType, setWalletAddress } = useRootData(
    ({ ethId, searchContacts, setContacts, setModal, setTransactionType, setWalletAddress }) => ({
      ethId: ethId.get(),
      searchContacts: searchContacts.get(),
      setContacts,
      setModal,
      setTransactionType,
      setWalletAddress,
    }),
  );

  const history = useHistory();

  const [addressValue, setAddressValue] = useState<string>('');
  const [isEditModalOpen, setEditModalOpen] = useState<boolean>(false);

  const arr: any = localStorage.getItem('contacts');
  const contacts = JSON.parse(arr);

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

  useEffect(() => {
    if (!ethId) {
      window.location.pathname = '/';
      history.push('/');
    }
  }, [ethId]);

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
                      setTransactionType('transfer');
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

                  <div className="contact-edit-wrapper">
                    <input
                      type="radio"
                      onClick={() => {
                        setAddressValue(address);
                        setEditModalOpen(true);
                      }}
                      className="balances-contact-edit"
                    ></input>
                    <div className={`contact-manage ${isEditModalOpen ? 'open' : 'closed'}`}>
                      <button
                        className="contact-manage-edit"
                        onClick={() => {
                          setAddressValue(address);
                          setModal('add-contact edit-contact');
                        }}
                      >
                        <img src={editicon} alt="edit" />
                        <p>Edit</p>
                      </button>
                      <button onClick={() => handleDelete(name)} className="contact-manage-delete">
                        <img src={deleteicon} alt="edit" />
                        <p>Delete</p>
                      </button>
                    </div>
                  </div>
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
