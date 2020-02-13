import React, { useCallback, useState } from 'react';

import { Button, Input, Modal } from 'antd';

import { useRootData } from '../../hooks/useRootData';

import { ISaveContactsProps } from './Types';

import { DEFAULT_ERROR } from '../../constants/errors';

const SaveContacts: React.FC<ISaveContactsProps> = ({ address, canceslModal, isModalOpen }): JSX.Element => {
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
    <Modal title="Save contact" visible={isModalOpen} onOk={canceslModal} onCancel={canceslModal}>
      <Input placeholder="name" value={name} onChange={e => setName(e.target.value)} />
      <Button onClick={handleSave}>Save</Button>
    </Modal>
  );
};

export default SaveContacts;
