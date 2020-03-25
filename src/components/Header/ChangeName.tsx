import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useRootData } from '../../hooks/useRootData';

import { IChangeNameProps } from './Types';

const ChangeName: React.FC<IChangeNameProps> = ({ setModalOpen }) => {
  const { zkWallet } = useRootData(({ zkWallet }) => ({
    zkWallet: zkWallet.get(),
  }));

  const inputRef = useRef<HTMLInputElement>(null);

  const oldName = localStorage.getItem(zkWallet ? zkWallet.address() : '');

  const [newName, setNewName] = useState<string>(oldName ? oldName : '');

  const handleChangeName = useCallback(
    e => {
      e.preventDefault();
      if (zkWallet) {
        localStorage.setItem(zkWallet.address(), newName);
      }
      setModalOpen(false);
    },
    [newName, setModalOpen, zkWallet],
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <form>
      <h3>Change name</h3>
      <input
        ref={inputRef}
        placeholder='Enter new name'
        value={newName}
        onChange={e => setNewName(e.target.value)}
      />
      <button
        type='submit'
        onClick={handleChangeName}
        className='btn btn-tr submit-button'
      >
        Save
      </button>
    </form>
  );
};

export default ChangeName;
