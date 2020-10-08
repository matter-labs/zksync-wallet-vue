import React, { useState, useCallback, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useStore } from 'src/store/context';
import { observer } from 'mobx-react-lite';
import makeBlockie from 'ethereum-blockies-base64';

import Modal from 'src/components/Modal/Modal';
import SaveContacts from 'components/SaveContacts/SaveContacts';
import { useTimeout } from 'hooks/timers';
import deleteicon from 'images/mdi_delete.svg';

import { WIDTH_BP } from 'constants/magicNumbers';

import './ContactInfo.scss';
import 'src/components/TokenInfo/TokenInfo.scss';

interface IDeletedContact {
  name: string;
  address: string;
  index: number;
}

interface IContactInfoProps {
  deletedContact: any;
  setDeletedContact: any;
}

export const ContactInfo: React.FC<IContactInfoProps> = observer(
  ({ deletedContact, setDeletedContact }) => {
    const store = useStore();
    const history = useHistory();

    const displayedName = store.newContactName
      ? (store.newContactName as string)
      : (store.walletAddress.name as string);
    const displayedAddress = store.newContactAddress
      ? (store.newContactAddress as string)
      : (store.walletAddress.address as string);

    const [oldContact, setOldContact] = useState<IOldContacts>({
      name: displayedName,
      address: displayedAddress,
    });
    const [isCopyModal, openCopyModal] = useState<boolean>(false);
    const [contacts, setContacts] = useState<any>();

    const updateContactList = useCallback(() => {
      const arr: string | null = window.localStorage?.getItem(
        `contacts${store.zkWallet?.address()}`,
      );
      setContacts(JSON.parse(arr as string));
    }, [setContacts, store.zkWallet]);
    useEffect(updateContactList, [
      setContacts,
      store.zkWallet,
      store.newContactName,
    ]);

    interface IOldContacts {
      name: string;
      address: string;
    }

    useEffect(() => {
      return () => {
        store.newContactName = '';
        store.newContactAddress = '';
      };
    }, [store.walletAddress.address]);

    useEffect(() => {
      if (store.zkWallet && !store.walletAddress.address) {
        history.push('/contacts');
      }
    }, [store.zkWallet, store.walletAddress]);

    const handleEdit = useCallback(() => {
      store.modalSpecifier = 'add-contact edit-contact';
    }, [store.walletAddress, setOldContact, store.modalSpecifier]);

    useEffect(() => {
      setOldContact({
        name: displayedName,
        address: displayedAddress,
      });
    }, [store.modalSpecifier, store.newContactName]);

    const inputRef: (HTMLInputElement | null)[] = [];

    const handleCopy = useCallback(
      address => {
        if (navigator.userAgent.match(/ipad|iphone/i)) {
          const input: any = document.getElementsByClassName(
            'copy-block-input',
          )[0];
          const range = document.createRange();
          range.selectNodeContents(input);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
          input.setSelectionRange(0, 999999);
          document.execCommand('copy');
        } else {
          inputRef.map(el => {
            if (address === el?.value) {
              el?.focus();
              el?.select();
              document.execCommand('copy');
            }
          });
        }
        openCopyModal(true);
      },
      [inputRef],
    );

    const handleDelete = useCallback(
      name => {
        const selectedItem = contacts.findIndex(el => {
          return el.name === displayedName;
        });
        setDeletedContact({
          name: contacts[selectedItem]?.name,
          address: contacts[selectedItem]?.address,
          index: selectedItem,
        });
        store.newContactName = '';
        store.walletAddress.name = '';
        const newContacts = contacts;
        newContacts.splice(selectedItem, 1);
        window.localStorage?.setItem(
          `contacts${store.zkWallet?.address()}`,
          JSON.stringify(newContacts),
        );
        store.modalSpecifier = '';
      },
      [contacts, store.modalSpecifier, store.zkWallet],
    );

    useTimeout(() => isCopyModal && openCopyModal(false), 2000, [isCopyModal]);

    return (
      <>
        <Modal
          visible={false}
          classSpecifier='add-contact'
          clickOutside={false}
          background={true}
          centered
        >
          <SaveContacts
            title='Add contact'
            addressValue={store.walletAddress.address}
            addressInput={false}
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
          />
          <button
            className='btn btn-cancel btn-tr delete'
            onClick={handleDelete}
          >
            <img src={deleteicon} alt='edit' />
            {'delete'}
          </button>
        </Modal>
        <div className='token-info-wrapper'>
          <button
            onClick={() => {
              history.goBack();
            }}
            className='transaction-back'
          ></button>
          <div className='contact-info-title'>
            <div className='contact-info-title name'>
              {store.newContactName || store.walletAddress.name ? (
                <>
                  <h2>{displayedName}</h2>
                  <button
                    className='contact-manage-edit btn-tr contact-page'
                    onClick={e => {
                      e.stopPropagation();
                      handleEdit();
                      store.isContact = true;
                    }}
                  >
                    <span className='edit-icon'></span>
                    <span>{' Edit'}</span>
                  </button>
                </>
              ) : (
                <button
                  className='btn submit-button transparent margin small'
                  onClick={() => {
                    store.modalSpecifier = 'add-contact';
                    store.isContact = false;
                  }}
                >
                  {'Add to contacts'}
                </button>
              )}
            </div>
            <span className='contact-info-title-address'>{'Address:'}</span>
            <div className='contact-info-address-container'>
              <img
                src={makeBlockie(displayedAddress)}
                alt='blockie-icon'
                className='transaction-blockie contact'
              />
              <p>
                {window?.innerWidth > WIDTH_BP
                  ? displayedAddress
                  : displayedAddress.replace(
                      displayedAddress.slice(14, displayedAddress?.length - 4),
                      '...',
                    )}
              </p>
              <button
                className={`copy-block-button btn-tr ${
                  isCopyModal ? 'copied' : ''
                }`}
                onClick={() => handleCopy(displayedAddress)}
              ></button>
              <input
                type='text'
                className='copy-block-input'
                readOnly
                value={displayedAddress}
                ref={e => inputRef.push(e)}
              />
            </div>
          </div>
          <button
            className='btn submit-button'
            onClick={() => {
              history.push('/transfer');
              store.walletAddress = {
                name: displayedName,
                address: displayedAddress,
              };
              store.transactionType = 'transfer';
            }}
          >
            <span className='send-icon'></span>
            {`Transfer ${
              store.walletAddress.name || store.newContactName
                ? `to ${displayedName}`
                : ''
            }`}
          </button>
        </div>
      </>
    );
  },
);
