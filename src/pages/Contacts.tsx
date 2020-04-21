import React, { useCallback, useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

import Modal from 'components/Modal/Modal';
import SaveContacts from 'components/SaveContacts/SaveContacts';
import editicon from 'images/icon-edit.svg';
import deleteicon from 'images/mdi_delete.svg';

import { useRootData } from 'hooks/useRootData';

import { DataList } from 'components/DataList/DataListNew';

import { WIDTH_BP } from 'constants/magicNumbers';
import { Transition } from 'components/Transition/Transition';
import { useTimeout } from 'hooks/timers';
import { useCheckLogin } from 'src/hooks/useCheckLogin';
import { FloatingMenu } from 'src/components/Common/FloatingMenu';

const Contacts: React.FC = (): JSX.Element => {
  const dataPropertyName = 'name';

  const {
    ethId,
    searchContacts,
    setContacts,
    setModal,
    setTransactionType,
    setWalletAddress,
    zkWallet,
  } = useRootData(
    ({
      ethId,
      searchContacts,
      setContacts,
      setModal,
      setTransactionType,
      setWalletAddress,
      zkWallet,
    }) => ({
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
    },
    [inputRef],
  );

  useTimeout(() => isCopyModal && openCopyModal(false), 2000, [isCopyModal]);

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
      setModal('');
      setContacts(contacts);
    },
    [contacts, setContacts, setModal, zkWallet],
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
            />
          </Modal>
          <button
            className='add-contact-button btn-tr'
            onClick={() => setModal('add-contact addressless')}
          >
            <span></span>
            <p>{'Add a contact'}</p>
          </button>
        </>
      )}
      emptyListComponent={() => <p>{"You don't have contacts yet..."}</p>}
      renderItem={({ address, name }) => (
        <div className='balances-contact' key={name}>
          <div className='balances-contact-left'>
            <span className='balances-contact-name'>{name}</span>
            <span className='balances-contact-address'>
              {window?.innerWidth > WIDTH_BP
                ? address
                : address.replace(address.slice(14, address.length - 4), '...')}
            </span>
          </div>
          <div className='balances-contact-right'>
            <Transition type='fly' timeout={200} trigger={isCopyModal}>
              <div className={'hint-copied open'}>
                <p>{'Copied!'}</p>
              </div>
            </Transition>
            <button
              className='balances-contact-send btn-tr'
              onClick={() => {
                setTransactionType('transfer');
                setWalletAddress([name, address]);
              }}
            >
              <Link to='/'></Link>
            </button>
            <button
              className='balances-contact-copy btn-tr'
              onClick={() => handleCopy(address)}
            ></button>
            <input
              onChange={undefined}
              className='copy-block-input'
              value={address.toString()}
              ref={e => inputRef.push(e)}
            />

            <FloatingMenu>
              <button
                className='contact-manage-edit'
                onClick={() => {
                  setModal('add-contact edit-contact');
                  setOldContact({ name: name, address: address });
                }}
              >
                <img src={editicon} alt='edit' />
                <p>{'Edit'}</p>
              </button>
              <button
                onClick={() => handleDelete(name)}
                className='contact-manage-delete btn-tr'
              >
                <img src={deleteicon} alt='edit' />
                <p>{'Delete'}</p>
                <Link to='/contacts'></Link>
              </button>
            </FloatingMenu>
          </div>
        </div>
      )}
    />
  );
};

export default Contacts;
