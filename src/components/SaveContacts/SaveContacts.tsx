import React, { useCallback, useState } from 'react';

import { useRootData } from '../../hooks/useRootData';

import { ISaveContactsProps } from './Types';

import { DEFAULT_ERROR } from '../../constants/errors';

const SaveContacts: React.FC<ISaveContactsProps> = ({ address }): JSX.Element => {
  const [name, setName] = useState<string>('');

  const { setError } = useRootData(({ setError }) => ({
    setError,
  }));

  const handleSave = useCallback(() => {
    try {
      if (address && name) {
        const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
        const isContact = contacts.find(
          ({ address: contactAddress, name: contactName }) => contactAddress === address || contactName === name,
        );
        if (!isContact) {
          const newContacts = JSON.stringify([{ address, name }, ...contacts]);
          localStorage.setItem('contacts', newContacts);
        }
      }
    } catch (err) {
      err.name && err.message ? setError(`${err.name}:${err.message}`) : setError(DEFAULT_ERROR);
    }
  }, [address, name, setError]);

  return (
    <>
      <input placeholder="name" value={name} onChange={e => setName(e.target.value)} />
      <button onClick={handleSave}>Save</button>
    </>
  );
};

export default SaveContacts;
