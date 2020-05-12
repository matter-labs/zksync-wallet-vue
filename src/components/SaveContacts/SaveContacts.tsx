import React, { useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { useMobxEffect } from 'src/hooks/useMobxEffect';
import { useStore } from 'src/store/context';

import { ISaveContactsProps } from './Types';

import { ADDRESS_VALIDATION } from 'constants/regExs';
import { useAutoFocus } from 'src/hooks/useAutoFocus';

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
            localStorage.getItem(`contacts${zkWallet?.address()}`) || '[]',
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
            localStorage.setItem(
              `contacts${zkWallet?.address()}`,
              JSON.stringify(newContacts),
            );
          }
          if (isContact === -1 && !edit) {
            const newContacts = JSON.stringify([
              { address, name },
              ...contacts,
            ]);
            localStorage.setItem(`contacts${zkWallet?.address()}`, newContacts);
          }
          if (isContact > -1) {
            const newContacts = contacts;
            newContacts.splice(isContact, 1, { address, name });
            localStorage.setItem(
              `contacts${zkWallet?.address()}`,
              JSON.stringify(newContacts),
            );
          }
          if (onSaveContact) onSaveContact();
          store.modalSpecifier = '';
          const arr: string | null = localStorage.getItem(
            `contacts${zkWallet?.address()}`,
          );
          const parsedContacts = JSON.parse(arr as string);
          store.searchContacts = parsedContacts;
        } else if (!name) {
          setConditionError('Error: name cannot be empty');
        } else {
          setConditionError(
            `Error: "${address?.slice(0, 6)}...${address?.slice(
              address?.length - 6,
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
        <span className='transaction-field-title'>{'Contact name'}</span>
        <input
          placeholder='Name here'
          ref={focusRef}
          value={name}
          onChange={e => setName(e.target.value)}
        />
        {addressInput && (
          <>
            <span className='transaction-field-title'>{'Address'}</span>
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
