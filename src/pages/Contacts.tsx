import React, { useCallback, useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

import Modal from '../components/Modal/Modal';
import SaveContacts from '../components/SaveContacts/SaveContacts';
import editicon from '../images/icon-edit.svg';
import deleteicon from '../images/mdi_delete.svg';

import { useRootData } from '../hooks/useRootData';

import DataList from '../components/DataList/DataList';

import { WIDTH_BP } from '../constants/magicNumbers';

const Contacts: React.FC = (): JSX.Element => {
  const dataPropertyName = 'name';

  const { ethId, searchContacts, setContacts, setModal, setTransactionType, setWalletAddress, zkWallet } = useRootData(
    ({ ethId, searchContacts, setContacts, setModal, setTransactionType, setWalletAddress, zkWallet }) => ({
      ethId: ethId.get(),
      searchContacts: searchContacts.get(),
      setContacts,
      setModal,
      setTransactionType,
      setWalletAddress,
      zkWallet: zkWallet.get(),
    }),
  );

  const history = useHistory();

  const arr: any = localStorage.getItem(`contacts${zkWallet?.address()}`);
  const contacts = JSON.parse(arr);
  interface IOldContacts {
    name: string;
    address: string;
  }

  const [isCopyModal, openCopyModal] = useState<boolean>(false);
  const [isEditModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [oldContact, setOldContact] = useState<IOldContacts>();

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
      openCopyModal(true);
      setTimeout(() => openCopyModal(false), 200);
    },
    [inputRef],
  );

  const handleDelete = useCallback(
    name => {
      const selectedItem = contacts.findIndex(el => {
        return el.name === name;
      });
      const newContacts = contacts;
      newContacts.splice(selectedItem, 1);
      localStorage.setItem(`contacts${zkWallet?.address()}`, JSON.stringify(newContacts));
      setModal('');
      setContacts(contacts);
    },
    [contacts, setContacts, setModal, zkWallet],
  );

  useEffect(() => {
    if (!ethId) {
      window.location.pathname = '/';
      history.push('/');
    }
  }, [ethId, history]);

  return (
    <DataList setValue={setContacts} dataProperty={dataPropertyName} data={contacts} title="Contacts" visible={true}>
      <Modal visible={false} classSpecifier="add-contact edit-contact" background={true}>
        <SaveContacts oldContact={oldContact} title="Edit contact" addressInput={true} edit={true} />
      </Modal>
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
                  {window?.innerWidth > WIDTH_BP
                    ? zkWallet?.address()
                    : zkWallet?.address().replace(zkWallet?.address().slice(14, zkWallet?.address().length - 4), '...')}
                </span>
              </div>
              <div className="balances-contact-right">
                <div className={`hint-copied ${isCopyModal ? 'open' : ''}`}>
                  <p>Copied!</p>
                </div>
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
                  value={address.toString()}
                  ref={e => inputRef.push(e)}
                />

                <div className="contact-edit-wrapper">
                  <input
                    type="radio"
                    onClick={() => {
                      setEditModalOpen(true);
                    }}
                    className="balances-contact-edit"
                  ></input>
                  <div className={`contact-manage ${isEditModalOpen ? 'open' : 'closed'}`}>
                    <button
                      className="contact-manage-edit"
                      onClick={() => {
                        setModal('add-contact edit-contact');
                        setOldContact({ name: name, address: address });
                      }}
                    >
                      <img src={editicon} alt="edit" />
                      <p>Edit</p>
                    </button>
                    <button onClick={() => handleDelete(name)} className="contact-manage-delete">
                      <img src={deleteicon} alt="edit" />
                      <p>Delete</p>
                      <Link to="/contacts"></Link>
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
    </DataList>
  );
};

export default Contacts;
