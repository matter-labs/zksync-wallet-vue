import React, { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';

import deleteicon from 'images/mdi_delete.svg';

import { useStore } from 'src/store/context';

import Modal from 'components/Modal/Modal';
import SaveContacts from 'components/SaveContacts/SaveContacts';

import { DataList } from 'components/DataList/DataListNew';

import { useCheckLogin } from 'src/hooks/useCheckLogin';
import { Contact } from './Contact';

const Contacts: React.FC = observer(
  (): JSX.Element => {
    const store = useStore();

    const { zkWallet } = store;

    interface IOldContacts {
      name: string;
      address: string;
    }

    interface IDeletedContact {
      name: string;
      address: string;
      index: number;
    }

    const [id, setId] = useState<any>();
    const [contacts, setContacts] = useState<any>();
    const [oldContact, setOldContact] = useState<IOldContacts>();
    const [deletedContact, setDeletedContact] = useState<IDeletedContact>();

    const updateContactList = useCallback(() => {
      const arr: string | null = window.localStorage?.getItem(
        `contacts${zkWallet?.address()}`,
      );
      setContacts(JSON.parse(arr as string));
    }, [setContacts, zkWallet]);
    useEffect(updateContactList, [setContacts, zkWallet]);

    const handleDelete = useCallback(
      name => {
        const selectedItem = contacts.findIndex(el => {
          return el.name === id;
        });
        setDeletedContact({
          name: contacts[selectedItem].name,
          address: contacts[selectedItem].address,
          index: selectedItem,
        });
        const newContacts = contacts;
        newContacts.splice(selectedItem, 1);
        window.localStorage?.setItem(
          `contacts${zkWallet?.address()}`,
          JSON.stringify(newContacts),
        );
        store.modalSpecifier = '';
      },
      [contacts, store.modalSpecifier, zkWallet],
    );

    const returnDeletedContact = useCallback(() => {
      const _c = contacts;
      _c.splice(deletedContact?.index, 0, {
        name: deletedContact?.name,
        address: deletedContact?.address,
      });
      window.localStorage?.setItem(
        `contacts${zkWallet?.address()}`,
        JSON.stringify(_c),
      );
      updateContactList();
      setDeletedContact(undefined);
    }, [contacts, deletedContact, zkWallet]);

    useCheckLogin();

    return (
      <>
        {!!deletedContact && (
          <p className='undo-text'>
            {`Contact "${deletedContact.name}" deleted.`}
            <span onClick={returnDeletedContact} className='undo-btn'>
              {'Undo'}
            </span>
          </p>
        )}
        <DataList
          data={(contacts as any[]) || []}
          title='Contacts'
          visible={true}
          header={() => (
            <>
              <Modal
                visible={false}
                classSpecifier='add-contact addressless'
                background={true}
                centered
                clickOutside={false}
              >
                <SaveContacts
                  title='Add contact'
                  addressValue=''
                  addressInput={true}
                  onSaveContact={updateContactList}
                />
              </Modal>
              <Modal
                visible={false}
                classSpecifier='add-contact edit-contact'
                background={true}
                centered
                clickOutside={false}
              >
                <SaveContacts
                  oldContact={oldContact}
                  title='Edit contact'
                  addressValue=''
                  addressInput={true}
                  onSaveContact={updateContactList}
                />
                <button
                  className='btn btn-cancel btn-tr delete'
                  onClick={handleDelete}
                >
                  <img src={deleteicon} alt='edit' />
                  {'delete'}
                </button>
              </Modal>
              <button
                className='add-contact-button btn-tr'
                onClick={() => {
                  store.isContact = false;
                  store.modalSpecifier = 'add-contact addressless';
                }}
              >
                <span></span>
                <p>{'Add a contact'}</p>
              </button>
            </>
          )}
          emptyListComponent={() => <p>{'The contact list is empty'}</p>}
          renderItem={contact => (
            <Contact
              key={contact.address}
              onSetOldContact={setOldContact}
              onDelete={handleDelete}
              setId={setId}
              {...contact}
            />
          )}
        />
      </>
    );
  },
);

export default Contacts;
