import React, { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';

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

    const [contacts, setContacts] = useState<any>();
    const [oldContact, setOldContact] = useState<IOldContacts>();

    const updateContactList = useCallback(() => {
      const arr: string | null = localStorage.getItem(
        `contacts${zkWallet?.address()}`,
      );
      setContacts(JSON.parse(arr as string));
    }, [setContacts, zkWallet]);
    useEffect(updateContactList, [setContacts, zkWallet]);

    const handleDelete = useCallback(
      name => {
        const selectedItem = contacts.findIndex(el => {
          return el.name === name;
        });
        const newContacts = contacts;
        newContacts.splice(selectedItem, 1);
        localStorage.setItem(
          `contacts${zkWallet?.address()}`,
          JSON.stringify(newContacts),
        );
        store.modalSpecifier = '';
      },
      [contacts, store.modalSpecifier, zkWallet],
    );

    useCheckLogin();

    return (
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
            >
              <SaveContacts
                oldContact={oldContact}
                title='Edit contact'
                addressValue=''
                addressInput={true}
                onSaveContact={updateContactList}
              />
            </Modal>
            <button
              className='add-contact-button btn-tr'
              onClick={() => (store.modalSpecifier = 'add-contact addressless')}
            >
              <span></span>
              <p>{'Add a contact'}</p>
            </button>
          </>
        )}
        emptyListComponent={() => <p>{"You don't have contacts yet..."}</p>}
        renderItem={contact => (
          <Contact
            key={contact.address}
            onSetOldContact={setOldContact}
            onDelete={handleDelete}
            {...contact}
          />
        )}
      />
    );
  },
);

export default Contacts;
