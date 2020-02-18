import React, { useCallback, useState } from 'react';

import { useRootData } from '../../hooks/useRootData';

import { ISaveContactsProps } from './Types';

import { DEFAULT_ERROR } from '../../constants/errors';

const SaveContacts: React.FC<ISaveContactsProps> = ({ addressInput, addressValue }): JSX.Element => {
  const [name, setName] = useState<string>('');
  const [address, setAddress] = useState<string>('');

  const { setError, setModal } = useRootData(({ setError, setModal }) => ({
    setError,
    setModal,
  }));

  const handleSave = useCallback(() => {
    try {
      if ((address && name) || (addressValue && name)) {
        const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
        if (addressValue) {
          setAddress(addressValue);
        }
        const isContact = contacts.find(
          ({ address: contactAddress, name: contactName }) => contactAddress === address || contactName === name,
        );
        if (!isContact) {
          const newContacts = JSON.stringify([{ address, name }, ...contacts]);
          localStorage.setItem('contacts', newContacts);
        }
        setModal('');
      }
    } catch (err) {
      err.name && err.message ? setError(`${err.name}:${err.message}`) : setError(DEFAULT_ERROR);
    }
  }, [address, addressValue, name, setError, setModal]);

  return (
    <>
      <h3>Add contact</h3>
      <div className="horizontal-line"></div>
      <span className="transaction-field-title">Contact name</span>
      <input placeholder="Name here" value={name} onChange={e => setName(e.target.value)} />
      {addressInput && (
        <>
          <span className="transaction-field-title">Address</span>
          <input placeholder="0x address" value={address} onChange={e => setAddress(e.target.value)} />
        </>
      )}
      <button className="btn submit-button" onClick={handleSave}>
        Save
      </button>
    </>
  );
};

export default SaveContacts;
