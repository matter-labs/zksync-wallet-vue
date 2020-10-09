import React, { useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { useMobxEffect } from 'src/hooks/useMobxEffect';
import { useStore } from 'src/store/context';

import { ISaveContactsProps } from './Types';

import { ADDRESS_VALIDATION } from 'constants/regExs';
import { useAutoFocus } from 'src/hooks/useAutoFocus';

import { addressMiddleCutter } from 'src/utils';

const SaveContacts: React.FC<ISaveContactsProps> = observer(
  ({
    addressInput,
    addressValue,
    edit,
    oldContact,
    title,
    onSaveContact,
  }): JSX.Element => {
    const [name, setName] = useState<string>(
      oldContact?.name ? oldContact.name : '',
    );
    const [address, setAddress] = useState<string>(
      oldContact?.address ? oldContact?.address : '',
    );
    const [conditionError, setConditionError] = useState<string>('');
    const store = useStore();

    const { zkWallet } = store;

    useMobxEffect(() => {
      if (addressValue) {
        setAddress(addressValue);
      }
    }, [addressValue, setAddress, store.modalSpecifier]);

    const handleSave = useCallback(
      e => {
        e.preventDefault();
        if (
          ((address && name) || (addressValue && name)) &&
          ADDRESS_VALIDATION['eth'].test(address)
        ) {
          const contacts = JSON.parse(
            window.localStorage?.getItem(`contacts${zkWallet?.address()}`) ||
              '[]',
          );
          const isContact = contacts.findIndex(
            ({ address: contactAddress, name: contactName }) =>
              contactAddress === address || contactName === name,
          );
          const oldContactIndex = contacts.findIndex(
            ({ name, address }) =>
              oldContact?.address === address || oldContact?.name === name,
          );
          if (edit && oldContactIndex > -1) {
            const newContacts = contacts;
            newContacts.splice(oldContactIndex, 1, { address, name });
            window.localStorage?.setItem(
              `contacts${zkWallet?.address()}`,
              JSON.stringify(newContacts),
            );
            store.newContactAddress = address;
            store.newContactName = name;
          }
          if (store.isContact === false && !edit) {
            const newContacts = JSON.stringify([
              { address, name },
              ...contacts,
            ]);
            window.localStorage?.setItem(
              `contacts${zkWallet?.address()}`,
              newContacts,
            );
            store.newContactAddress = address;
            store.newContactName = name;
          }
          if (store.isContact === true) {
            const newContacts = contacts;
            newContacts.splice(isContact, 1, { address, name });
            window.localStorage?.setItem(
              `contacts${zkWallet?.address()}`,
              JSON.stringify(newContacts),
            );
            store.newContactAddress = address;
            store.newContactName = name;
          }
          if (onSaveContact) onSaveContact();
          store.modalSpecifier = '';
          const arr: string | null = window.localStorage?.getItem(
            `contacts${zkWallet?.address()}`,
          );
          const parsedContacts = JSON.parse(arr as string);
          store.searchContacts = parsedContacts;
        } else if (!name) {
          setConditionError('Error: name cannot be empty');
        } else {
          setConditionError(
            `Error: "${addressMiddleCutter(
              address,
              6,
              6,
            )}" doesn't match ethereum address format`,
          );
        }
      },
      [
        address,
        addressValue,
        edit,
        name,
        setConditionError,
        oldContact,
        store.modalSpecifier,
        store.searchContacts,
        zkWallet,
        onSaveContact,
      ],
    );

    const focusRef = useAutoFocus();

    return (
      <form>
        <h3>{title}</h3>
        <div className='horizontal-line'></div>
        <span className='transaction-field-title plain'>{'Contact name'}</span>
        <input
          placeholder='Name here'
          ref={focusRef}
          value={name}
          onChange={e => setName(e.target.value)}
        />
        {addressInput && (
          <>
            <span className='transaction-field-title plain'>{'Address'}</span>
            <input
              placeholder='0x address'
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
          </>
        )}
        <div className='error-container'>
          <p className={`error-text ${!!conditionError ? 'visible' : ''}`}>
            {conditionError}
          </p>
        </div>
        <button
          type='submit'
          className='btn submit-button'
          onClick={handleSave}
        >
          {'Save'}
        </button>
      </form>
    );
  },
);

export default SaveContacts;
