import React, { useCallback, useState } from 'react';

import { useRootData } from '../../hooks/useRootData';

import { ISaveContactsProps } from './Types';

import { ADDRESS_VALIDATION } from '../../constants/regExs';

const SaveContacts: React.FC<ISaveContactsProps> = ({
  addressInput,
  addressValue,
  edit,
  oldContact,
  title,
}): JSX.Element => {
  const [name, setName] = useState<string>('');
  const [address, setAddress] = useState<string>('');

  const { setContacts, setError, setModal } = useRootData(({ setContacts, setError, setModal }) => ({
    setContacts,
    setError,
    setModal,
  }));

  const handleSave = useCallback(() => {
    if (((address && name) || (addressValue && name)) && ADDRESS_VALIDATION['eth'].test(address)) {
      const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
      if (addressValue) {
        setAddress(addressValue);
      }
      const isContact = contacts.findIndex(
        ({ address: contactAddress, name: contactName }) => contactAddress === address || contactName === name,
      );
      const oldContactIndex = contacts.findIndex(
        ({ name, address }) => oldContact?.address === address || oldContact?.name === name,
      );
      if (edit && oldContactIndex > -1) {
        const newContacts = contacts;
        newContacts.splice(oldContactIndex, 1, { address, name });
        localStorage.setItem('contacts', JSON.stringify(newContacts));
      }
      if (isContact === -1 && !edit) {
        const newContacts = JSON.stringify([{ address, name }, ...contacts]);
        localStorage.setItem('contacts', newContacts);
      }
      if (isContact > -1) {
        const newContacts = contacts;
        newContacts.splice(isContact, 1, { address, name });
        localStorage.setItem('contacts', JSON.stringify(newContacts));
      }
      setModal('');
      const arr: any = localStorage.getItem('contacts');
      const acontacts = JSON.parse(arr);
      setContacts(acontacts);
    } else if (!name) {
      setError('Error: name cannot be empty');
    } else {
      setError(`Error: "${address}" doesn't match ethereum address format`);
    }
  }, [address, addressValue, name, setContacts, setError, setModal]);

  return (
    <>
      <h3>{title}</h3>
      <div className="horizontal-line"></div>
      <span className="transaction-field-title">Contact name</span>
      <input placeholder="Name here" value={name ? name : oldContact?.name} onChange={e => setName(e.target.value)} />
      {addressInput && (
        <>
          <span className="transaction-field-title">Address</span>
          <input
            placeholder="0x address"
            value={address ? address : oldContact?.address}
            onChange={e => setAddress(e.target.value)}
          />
        </>
      )}
      <button className="btn submit-button" onClick={handleSave}>
        Save
      </button>
    </>
  );
};

export default SaveContacts;
